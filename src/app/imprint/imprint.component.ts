import { Component, OnInit, Renderer2 } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AppConfiguration } from '../app-config/app-config.service';
import { OverlayContent } from '../shared/overlay.service';

export type ImprintTypes = 'AGB' | 'PRIVACY' | 'DISCLAIMER';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent implements OnInit, OverlayContent<ImprintTypes> {

  headline : 'DISCLAIMER' | 'PRIVACY' | 'AGB';
  text : string;
  url: string;

  constructor(
    private appConfigService: AppConfiguration,
    //private ref: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) { }
  data: ImprintTypes;
  private _closeEvent = new Subject<void>();
  closeEvent =  this._closeEvent.asObservable();

  ngOnInit(): void {
    this.appConfigService.getImprint(this.data).subscribe(data => this.handleAction(data));
  }

  private handleAction(data: {text?: string, textType?: string}) {
    if(data.textType !== 'PDF') {
      this.headline = this.data;
      if(data.textType === 'STRING') {
        this.text = data.text;
        this.url = null;
      } else {
        this.text = null;
        this.url = data.text;
        window.open(data.text, '_blank');
      }
      /*this.text = null;
      this._closeEvent.next();
      window.open(data.text, '_blank');*/
    } else {
      this.headline = this.data;
      if(data.text)
        this.text = data.text;
    }
  }
}
