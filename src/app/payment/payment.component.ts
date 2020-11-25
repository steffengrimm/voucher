import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Injector } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConfiguration } from 'src/app/app-config/app-config.service';
import { PaymentMethodSelection, PaymentMethod, PaymentHandlerDto } from 'src/app/shared/dto';
//import { OrderSettingsService } from 'src/app/shared/order-settings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DynamicScriptLoaderService } from 'src/app/shared/dynamic-script-loader.service';
import { TokenHandler } from 'src/app/app-config/token-handler.service';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { CartService, Voucher } from '../shared/cart.service';
import { NavigationService } from '../shared/navigation.service';
import { AbstractPaymentHandler } from './payment-handlers/common-payment-handler';
import { ConcardisHandler } from './payment-handlers/concardis-handler.service';
import { DummyHandler } from './payment-handlers/dummy-handler.service';
import { StripeHandler } from './payment-handlers/stripe-handler.service';
//import * as Stripe from 'stripe-v3';
/// <reference types="stripe-v3" />


declare var Stripe : any;

export function paymentRequestButtonChecker(appConfigHelper: AppConfiguration, scriptLoader: DynamicScriptLoaderService) {
  let appConfig = appConfigHelper.getConfiguration().appConfig;
  if(appConfig.paymentMethods.includes('MOBILEPAYMENT') && appConfig.paymentKeys.STRIPE) {
    let stripeKey = appConfig.paymentKeys.STRIPE;
    return async() => {
      await scriptLoader.loadScript('stripe');

      let stripe = Stripe(stripeKey);
      let result = await stripe.paymentRequest({
        country: 'DE',
        currency: 'eur',
        total: {
          label: 'check requestbutton',
          amount: 0
        }
      }).canMakePayment()

      return result;
    }
  }
  return async() => null;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  private paymentRequest : {applePay?: boolean};
  private paymentKeys: PaymentHandlerDto;
  paymentMethods: PaymentMethodSelection
  private _selectedPaymentMethod : PaymentMethod = null;
  ccForm: FormGroup;

  private validitySubscription : Subscription;
  private lastValidityState = false;

  private paymentHandler : AbstractPaymentHandler;

  private _isLastPage = new BehaviorSubject(false);
  readonly isLastPage$ = this._isLastPage.asObservable();
  showCardForm = false;
  private paymentPending = false;

  @ViewChild('cardNumber') cardNumberDOM : ElementRef | undefined;
  @ViewChild('cardExpiry') cardExpiryDOM : ElementRef | undefined;
  @ViewChild('cardCvc') cardCvcDOM : ElementRef | undefined;
  @ViewChild('article') article: ElementRef;

  /////////////////////////////////

  allItems$ : Observable<Voucher[]>;
  totalSum$ : Observable<number>;
  customerData : string = "";

  constructor(
    private cartService : CartService,
    private navigationService: NavigationService,
    private appConfig: AppConfiguration,
    private router: Router,
    private route: ActivatedRoute,
    private injector: Injector
  ) {
    this.ccForm = new FormGroup({
      cardHolder: new FormControl('',Validators.required)
    });
    this.paymentKeys = this.appConfig.getConfiguration().appConfig.paymentKeys;
  }

  ngOnInit(): void {
    this.paymentMethods = this.appConfig.getConfiguration().appConfig.paymentMethods;
    this.paymentRequest = this.route.snapshot.data.paymentRequest;

    if(this.paymentMethods.length === 1)
      this.selectedPaymentMethod = this.paymentMethods[0];

    this.navigationService.toggleBackward(true);
    
    this.navigationService.onBeforeNavigationBackward = async() => {
      if(this._isLastPage.value) {
        this._isLastPage.next(false);
        return false;
      }
      return true;
    };

    this.navigationService.onBeforeNavigationForward = async() => {
      if(!this._isLastPage.value) {
        try {
          await this.paymentHandler.createPaymentMethod({name: this.ccForm.get('cardHolder').value, email: this.cartService.customerEmail});
          this._isLastPage.next(true);
        } catch(e) {
          //Fehlerbehandlung
        }
      } else if(!this.paymentPending) {
        this.paymentPending = true;
        await this.submitPayment();
        return true;
      }
      return false;
    }

    this.isLastPage$.subscribe(isLastPage => {
      this.navigationService.toggleStore(isLastPage);
    })

    this.allItems$ = this.cartService.readOnlyItems$;
    this.totalSum$ = this.cartService.totalPrice;
    this.customerData = this.cartService.customerEmail;
  }
  
  ngOnDestroy() : void {
    this.validitySubscription?.unsubscribe();
  }

  hasPaymentRequest() {
    return this.paymentRequest !== null;
  }

  hasApplePay() : boolean {
    return this.paymentRequest?.applePay ?? false
  }

  get selectedPaymentMethod() {
    //return PaymentMethod[PaymentMethod.CREDITCARD];
    return PaymentMethod[this._selectedPaymentMethod];
  }

  set selectedPaymentMethod(m: string | PaymentMethod) {
    const method = typeof m === 'string' ? PaymentMethod[m] : m;
    //console.log(method);
    if(method) {
      this._selectedPaymentMethod = method;
      this.injectPaymentHandler();
    }
  }

  async injectPaymentHandler() {
    if(this._selectedPaymentMethod === PaymentMethod.CREDITCARD || this._selectedPaymentMethod === PaymentMethod.MOBILEPAYMENT) {
      if(this.paymentKeys.STRIPE)
        this.paymentHandler = this.injector.get(StripeHandler);
      else if(this.paymentKeys.CONCARDIS)
        this.paymentHandler = this.injector.get(ConcardisHandler);
    } else if(this._selectedPaymentMethod === PaymentMethod.PAYPAL) {
      this.paymentHandler = this.injector.get(null);
    } else {
      this.paymentHandler = this.injector.get(DummyHandler)
    }

    this.validitySubscription = combineLatest([this.paymentHandler.formValid$,this.ccForm.statusChanges, this.isLastPage$, this.navigationService.navigationEvent$]).subscribe(([isCreditcardValid,isNameValid,isLastPage]) => {
      //console.table({creditcardValid: isCreditcardValid, nameValid: isNameValid === 'VALID', isLastPage: isLastPage});
      this.navigationService.toggleForward(isCreditcardValid && isNameValid === 'VALID' || isLastPage)
    });
    const intent = await this.cartService.setPaymentMethod(this._selectedPaymentMethod);
    await this.buildPaymentForm(intent);
  }

  async buildPaymentForm(paymentIntent : string) {
    await this.paymentHandler.initialize(paymentIntent);

    if(this._selectedPaymentMethod === PaymentMethod.CREDITCARD) {
      this.showCardForm = true;
      
      await this.paymentHandler.buildCCForm();
      this.paymentHandler.mountCardCvc(this.cardCvcDOM.nativeElement);
      this.paymentHandler.mountCardExpiry(this.cardExpiryDOM.nativeElement);
      this.paymentHandler.mountCardNumber(this.cardNumberDOM.nativeElement);
    } else {
      this.showCardForm = false;

      if(this._selectedPaymentMethod === PaymentMethod.MOBILEPAYMENT)
        await this.paymentHandler.buildMobilePaymentForm();
    }

  }

  async submitPayment() {
    try {
      await this.paymentHandler.handlePayment();
      await this.paymentHandler.closeShoppingCart();
    } catch(e) {
      this.paymentPending = false;
    }
  }
}
