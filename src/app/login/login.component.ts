import { createOfflineCompileUrlResolver } from '@angular/compiler';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validators, AbstractControl, FormBuilder, ValidationErrors, AsyncValidatorFn, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, first } from 'rxjs/operators'
//import { OrderSettingsService } from '../../shared/order-settings.service';
//import { customizedRequiredGroup } from './customized-required-group';
import { UserState } from 'src/app/shared/dto';
import { CartService } from '../shared/cart.service';
import { NavigationService } from '../shared/navigation.service';

enum LoginMode {
  check,
  capture,
  invoice
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userForm = this.formBuilder.group({
    loginData: this.formBuilder.group({
      checkEmail: ['', [Validators.required,Validators.email,Validators.pattern(/@(\S+?\.[^.]{2,})$/)], this.knownUserValidator()],
      checkEmailRetype: ['', [Validators.required,Validators.email,Validators.pattern(/@(\S+?\.[^.]{2,})$/)]],
      userData: this.formBuilder.group({
        prefix: [null],
        title: [''],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        company: [''],
        phone: ['', Validators.required],
      })
    }),
    invoiceWanted: [false],
    invoiceData: this.formBuilder.group({
      street: ['', Validators.required],
      houseNumber: ['', Validators.required],
      zip: ['', Validators.required],
      city: ['', Validators.required],
      addressSuffix: [''],
      costCentre: [''],
      vatId: [''],
    })
  })

  userStates = UserState;
  private _currentUserState : UserState;

  loginModes = LoginMode;
  currentLoginMode : LoginMode;

  constructor(
    private navigationService: NavigationService,
    private route : ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.navigationService.toggleBackward(true);

    this.userForm.get('loginData.checkEmailRetype').setAsyncValidators(this.equalControlValidator(this.userForm.get('loginData.checkEmail')));
    
    this.route.paramMap.subscribe(params => {
      this.currentLoginMode = LoginMode[params.get('mode')];
      if(typeof this.currentLoginMode === typeof undefined ||
        this.currentLoginMode !== this.loginModes.check && typeof this.currentUserState === typeof undefined ||
        this.currentLoginMode === this.loginModes.capture && this.currentUserState !== this.userStates.UNKNOWN ||
        this.currentLoginMode === this.loginModes.invoice && this.currentUserState !== this.userStates.INVOICEDATAMISSING) {
          //console.log("REDIRECT");
          this.router.navigate(['login/check'],{replaceUrl: true});
      }
      this.setInvoiceVisiblility(this.currentLoginMode === this.loginModes.invoice);
    });

    combineLatest([this.userForm.statusChanges,this.navigationService.navigationEvent$]).subscribe(() => {
      this.navigationService.toggleForward(this.isFormValid())
    });

    if(this.cartService.customerEmail)
      this.userForm.get('loginData.checkEmail').setValue(this.cartService.customerEmail);

    this.navigationService.onBeforeNavigationBackward = async () => {
      if(this.currentLoginMode === this.loginModes.check)
        return true;
      this.router.navigate(['/login/check']);
      return false;
    }

    this.navigationService.onBeforeNavigationForward = async () => {
      return await this.cartService.postUserFormData(this.userForm.value);
    }
  }

  knownUserValidator(): AsyncValidatorFn {
    const subject = new BehaviorSubject<string>('');
    const debouncedInput$ = subject.asObservable().pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((mailAddress : string) => this.cartService.findUser(mailAddress)),
      map(state => {this.setCurrentUserState(state); return null}),
      first()
    );
    return (ctrl: AbstractControl): Observable<ValidationErrors> => {
      subject.next(ctrl.value);
      return debouncedInput$;
    };
  }

  equalControlValidator(other: AbstractControl): AsyncValidatorFn {
    return (ctrl: AbstractControl) : Promise<ValidationErrors> => {
      if(ctrl.value === other.value)
        return Promise.resolve(null);
      return Promise.resolve({unequalEmailAddresses: true});
    }
  }

  get emailInvalid() : boolean {
    let email = this.userForm.get("loginData.checkEmail");
    return email.dirty && email.invalid;
  }

  get enteringData() : boolean {
    return this.currentLoginMode === LoginMode.capture || this.currentLoginMode === LoginMode.invoice;
  }

  get currentUserState() {
    return this._currentUserState;
  }

  private setCurrentUserState(state: UserState) {
    const hasChanged = this._currentUserState !== state;
    this._currentUserState = state;
    if(hasChanged)
      this.userForm.updateValueAndValidity();
  }

  get invoiceVisibility() {
    return this.userForm.get('invoiceWanted').value;
  }

  private setInvoiceVisiblility(visible: boolean) {
    this.userForm.get('invoiceWanted').setValue(visible);
  }

  isFormValid() : boolean {
    if(this.userForm.get("loginData.checkEmail").invalid) { //E-Mail is invalid
      this.setCurrentUserState(undefined);
      return false;
    }
    switch(this.currentUserState) {
      case UserState.COMPLETE:
        return true;
      case UserState.INVOICEDATAMISSING:
        return this.userForm.get("invoiceData").valid || !this.invoiceVisibility;
      case UserState.UNKNOWN:
        return this.userForm.get("loginData").valid && (this.userForm.get("invoiceData").valid || !this.invoiceVisibility);
      default:
        return false;
    }
  }
}
