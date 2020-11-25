import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  providers: [{
    provide : NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => RadioButtonComponent),
    multi : true, 
  }]
})
export class RadioButtonComponent implements OnInit, ControlValueAccessor {
  @Input() private value : any;
  @Input() private toggle? : any;
  private baseValue : any
  private _state : boolean;
  private _disabled : boolean;
  toggleable : boolean
  
  onChange = (_:any) => {};
  onTouched = () => {};

  constructor() {}

  ngOnInit(): void {
    this.baseValue = this.value;
    this.toggleable = !!this.toggle;
  }

  writeValue(obj: any): void {
    this._state = this.toggleable ? !!obj : this.value === obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = (x) => {
      this._state = this.value === this.baseValue;
      return fn(this.toggleable ? x.target.checked : this.baseValue)
    };
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  checked() : boolean {
    return this._state;
  }
}
