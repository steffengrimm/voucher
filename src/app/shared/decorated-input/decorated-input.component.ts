import { Component, OnInit, ViewEncapsulation, forwardRef, OnDestroy, ViewChild, Input, HostBinding, Optional } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormControlDirective, ControlContainer, AbstractControl } from '@angular/forms'
import { of, Subscription } from 'rxjs';
import { ConditionalExpr } from '@angular/compiler';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-decorated-input',
  templateUrl: './decorated-input.component.html',
  styleUrls: ['./decorated-input.component.scss'],
  providers: [{
      provide: NG_VALUE_ACCESSOR, 
      useExisting: forwardRef(() => DecoratedInputComponent),
      multi: true
  }]
})
export class DecoratedInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @ViewChild(FormControlDirective, {static: true}) formControlDirective: FormControlDirective;
  @Input() formControl: FormControl;
  @Input() formControlName: string;
  @Input() readonly: boolean;
  @Input() type: string = "text";
  @Input() autocomplete: string = "off";
  @HostBinding("class.required") required : boolean;
  @HostBinding("class.focused") focused : boolean;
  focusedSubscription : Subscription;

  onChange : Function;

  constructor(private controlContainer: ControlContainer) {}
  
  get inputControl() {
    return this.formControl || this.controlContainer.control.get(this.formControlName);
  }

  ngOnInit() : void {
    this.required = this.isRequired();

    this.focused = String(this.inputControl.value??"").length > 0;

    this.focusedSubscription = this.inputControl?.valueChanges.pipe(map(v => String(v??"").length > 0),distinctUntilChanged()).subscribe(f => {
      this.focused = f;
    })
  }

  ngOnDestroy() : void {
    this.focusedSubscription?.unsubscribe();
  }

  isRequired() {
    if (this.inputControl?.validator) {
      const validator = this.inputControl?.validator({} as AbstractControl);
      if (validator && validator.required) {
        this.required = true;
        return true;
      }
    }
    return false;
  }

  get isFocused() {
    return this.focused;
  }
  
  writeValue(value: any): void {
    this.formControlDirective.valueAccessor.writeValue(value);
  }
  registerOnChange(fn: (_: any) => void): void {
    this.formControlDirective.valueAccessor.registerOnChange(fn);
  }
  registerOnTouched(fn: () => void): void {
    this.formControlDirective.valueAccessor.registerOnTouched(fn);
  }
  setDisabledState(isDisabled: boolean): void {
    this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
  }
}
