import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { OverlayContent } from 'src/app/shared/overlay.service';

@Component({
  selector: 'app-custom-value',
  templateUrl: './custom-value.component.html',
  styleUrls: ['./custom-value.component.scss']
})
export class CustomValueComponent implements OnInit, OverlayContent<Subject<number>> { 

  constructor() { }
  private _closeEvent = new Subject<void>();
  closeEvent = this._closeEvent.asObservable();
  data: Subject<number>;
  currentValue : string = "";

  ngOnInit(): void {
  }

  add(char: number | string) {
    if(typeof char === 'string') {
      if(this.currentValue.indexOf('.') < 0 && this.currentValue.length > 0)
        this.currentValue += '.';
    } else {
      const commaPosition = this.currentValue.indexOf('.')
      if(commaPosition === -1 || commaPosition >= this.currentValue.length - 2)
        this.currentValue += ''+char;
    }
  }

  clear() {
    this.currentValue = "";
  }

  apply() {
    let float = parseFloat(this.currentValue) * 100;
    if(isNaN(float)) {
      this.clear();
      return
    }

    this.data.next(float);
    this._closeEvent.next();
  }

}
