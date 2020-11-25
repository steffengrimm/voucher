import { AbstractPaymentHandler } from './common-payment-handler';
import { Injectable, Injector } from '@angular/core';
import { DynamicScriptLoaderService } from 'src/app/shared/dynamic-script-loader.service';
import { AppConfiguration } from 'src/app/app-config/app-config.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, scan } from 'rxjs/operators';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
/// <reference types="stripe-v3" />

declare var Stripe : any;

const elementStyles = {
    base: {
        fontSize: '16px',
        color: "#abaaa9",
        '::placeholder': {
            color: '#abaaa9',
        },
        ':-webkit-autofill': {
            color: '#e39f48',
        },
        lineHeight: '30px',
        textAlign: 'center'
    },
    invalid: {
        color: '#E25950',
        '::placeholder': {
            color: '#FFCCA5',
        }
    },
    complete: {
        color: '#00b1e7'
    }
  };

@Injectable({
    providedIn: 'root'
})
export class StripeHandler extends AbstractPaymentHandler {
    private stripe: any;// stripe.Stripe;
    private paymentMethod: any;// stripe.paymentMethod.PaymentMethod

    cardNumber: any;// stripe.elements.Element;
    cardExpiry: any;// stripe.elements.Element;
    cardCvc: any;// stripe.elements.Element;

    //private _ccFormValid : {cardNumber: boolean, cardExpiry: boolean, cardCvc: boolean} = {cardNumber: false, cardExpiry: false, cardCvc: false};
    private _cardNumberValid = new BehaviorSubject(false);
    private _cardExpiryValid = new BehaviorSubject(false);
    private _cardCvcValid = new BehaviorSubject(false);

    constructor(injector: Injector) {
        super(injector);
        this.publicKey = this.appConfig.getConfiguration().appConfig.paymentKeys.STRIPE;

        this.formValid$ = combineLatest([this._cardNumberValid,this._cardExpiryValid,this._cardCvcValid]).pipe(map(([number,expiry,cvc]) => number && expiry && cvc));
    }

    get PPPPP() {
        return this.paymentMethod();
    }

    async initialize(paymentIntent: string) : Promise<void> {
        this.paymentIntent = paymentIntent;
        await this.scriptLoader.loadScript('stripe');
    }

    async buildCCForm() : Promise<void> {
        this.stripe = Stripe(this.publicKey);
        let elements = this.stripe.elements();
        this.cardNumber = elements.create('cardNumber', {style: elementStyles, hideIcon: true});
        this.cardExpiry = elements.create('cardExpiry', {style: elementStyles});
        this.cardCvc = elements.create('cardCvc', {style: elementStyles});
    
        this.cardNumber.on('change', e => {
            this._cardNumberValid.next(e.complete);
        });
    
        this.cardExpiry.on('change', e => {
          this._cardExpiryValid.next(e.complete);
        });
    
        this.cardCvc.on('change', e => {
          this._cardCvcValid.next(e.complete);
        });
    }

    mountCardNumber(domElement: any) : void {
        this.cardNumber.mount(domElement);
    }
    
    mountCardExpiry(domElement: any) : void {
        this.cardExpiry.mount(domElement);
    }
    
    mountCardCvc(domElement: any) : void {
        this.cardCvc.mount(domElement);
    }

    async buildMobilePaymentForm() : Promise<void> {

    }

    async createPaymentMethod(cardHolder: {name: string, email: string}): Promise<void> {
        let paymentMethod = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.cardNumber,
            billing_details: {
                name: cardHolder.name,
                email: cardHolder.email
            }
        });
        if(paymentMethod.error)
            throw (paymentMethod.error.message);
        this.paymentMethod = paymentMethod.paymentMethod;
    }

    async handlePayment(browserCallback? : Function) : Promise<string> {
        let confirm = await this.stripe.confirmCardPayment(this.paymentIntent, {payment_method: this.paymentMethod.id},{handleActions: false})
        if(confirm.error) {
            if(browserCallback)
                browserCallback('fail');
            throw confirm.error.message
        }
        if(browserCallback)
            browserCallback('success');

        if(confirm.paymentIntent.status === 'requires_action' || confirm.paymentIntent.status === 'requires_source_action') { //3DS Handling
            return await this.stripe.confirmCardPayment(this.paymentIntent).then((result:any) => {
                if(result.error)
                    throw result.error.message;

                else return result.paymentIntent.id;
            });
        } else {
            return confirm.paymentIntent.id;
        }
    }
}