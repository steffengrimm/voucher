import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-quantity',
  templateUrl: './quantity.component.html',
  styleUrls: ['./quantity.component.scss']
})
export class QuantityComponent {
  constructor() { }
  @Input('input') private _input : number;
  printableInput : any;
  @Output() output = new EventEmitter<number>();

  private inputSubscription : Subscription;

  get value() : any {
    return isNaN(this._input) ? "" : this._input;
  }

  set value(value: any) {
    this.output.emit(parseInt(value));
  }

  tryDecrease() {
    if(this._input > 0)
      this.value = this._input - 1
  }

  tryIncrease() {
    this.value = isNaN(this._input) ? 1 : this._input + 1;
  }

}
