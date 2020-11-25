import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { AppConfiguration } from '../app-config/app-config.service';
import { CartService } from '../shared/cart.service';
import { NavigationService } from '../shared/navigation.service';
import { OverlayService } from '../shared/overlay.service';
import { CustomValueComponent } from './custom-value/custom-value.component';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.scss']
})
export class ValueComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly presetValues : number[]
  readonly valueBoundaries : {min: number, max: number};

  private currentValue = new BehaviorSubject<number>(NaN);
  readonly currentValue$ = this.currentValue.asObservable();

  private currentQuantity = new BehaviorSubject<number>(NaN);
  readonly currentQuantity$ = this.currentQuantity.asObservable();
  private _currentValueIsPreset = true;
  get currentValueIsPreset() {
    return this._currentValueIsPreset;
  }

  currentSum: string = "";
  isInputValid : boolean = false;

  private valueQuantitySubscription : Subscription;
  private quantityNaNSubscription : Subscription;

  constructor(
    private navigationService: NavigationService,
    private appConfig: AppConfiguration,
    private cartService : CartService,
    private router: Router,
    private overlayService: OverlayService<Subject<number>>
  ) {
    const conf = this.appConfig.getConfiguration().appConfig;
    this.presetValues = conf.presetValues;
    this.valueBoundaries = conf.valueBoundaries;
  }

  ngOnInit(): void {
    this.navigationService.toggleBackward(true);
    this.valueQuantitySubscription = combineLatest([this.currentValue$, this.currentQuantity$]).subscribe(([value, quantity]) => {
      const sum = value * quantity;
      this.currentSum = isNaN(sum) ? "" : "" + sum;

      const isInputValid = value >= this.valueBoundaries.min && value <= this.valueBoundaries.max && quantity > 0;
      this.isInputValid = isInputValid;
      this.navigationService.toggleForward(isInputValid);
    });

    this.navigationService.onBeforeNavigationBackward = () => Promise.resolve(true);
    this.navigationService.onBeforeNavigationForward = async () => {
      await this.upsertChanges();
      return true;
    }

    this.quantityNaNSubscription = this.currentValue$.subscribe(() => {
      if(isNaN(this.currentQuantity.value)) {
        this.currentQuantity.next(1);
      }
    })
  }

  ngOnDestroy() {
    this.valueQuantitySubscription?.unsubscribe();
    this.quantityNaNSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if(this.cartService.hasActiveVoucher) {
      setTimeout(() => {
        this.currentValue.next(this.cartService.activeVoucher.initialValue ?? NaN);
        if(!isNaN(this.cartService.activeVoucher.initialValue ))
          this._currentValueIsPreset = this.presetValues.includes(this.cartService.activeVoucher.initialValue);

        this.currentQuantity.next(this.cartService.activeVoucher.quantity ?? NaN);
      });
    }
  }

  setPresetValue(value: number) {
    this._currentValueIsPreset = true;
    this.currentValue.next(value);
  }

  setQuantity(quantity: any) {
    this.currentQuantity.next(quantity);
  }

  selectCustomValue() {
    const tempSubject = new Subject<number>();
    this.overlayService.openOverlay('REGULAR', CustomValueComponent, tempSubject);
    tempSubject.subscribe(value => {
      this._currentValueIsPreset = false;
      this.currentValue.next(Math.max(Math.min(this.valueBoundaries.max,value),this.valueBoundaries.min));
    });
  }

  async continueWithNextVoucher() {
    await this.upsertChanges();
    this.cartService.makeNewVoucher();
    this.router.navigate(['layout']);
  }

  private async upsertChanges() {
    this.cartService.setValue(this.currentValue.value);
    this.cartService.setQuantity(this.currentQuantity.value)
    await this.cartService.upsertActiveVoucher();
  }
}
