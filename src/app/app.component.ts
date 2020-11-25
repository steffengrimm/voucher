import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, LOCALE_ID, ViewChild } from '@angular/core';
import { RegularOverlayComponent } from './shared/regular-overlay/regular-overlay.component';
import { OverlayService } from './shared/overlay.service';
import { AlertOverlayComponent } from './shared/alert-overlay/alert-overlay.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('regularOverlay', { static: false }) regularOverlay: RegularOverlayComponent<any>;
  @ViewChild('alertOverlay', { static: false }) alertOverlay: AlertOverlayComponent<never>;

  constructor(@Inject(DOCUMENT) private document: Document, private overlayService: OverlayService<any>) {
    const temp = this.document.createElement("div");
    temp.style.position = "absolute";
    temp.style.top = "-9999px";
    temp.style.width = "100px";
    temp.style.overflow = "scroll";
    temp.style.visibility = "hidden";
    document.body.appendChild(temp);
    
    const result = temp.clientWidth - temp.offsetWidth;
    temp.parentNode.removeChild(temp);
    this.document.documentElement.style.setProperty('--scrollBarSize',`${result}px`);
    this.document.documentElement.lang = 'de';
  }

  ngAfterViewInit() {
    this.overlayService.registerOutlet(this.regularOverlay, 'REGULAR');
    this.overlayService.registerOutlet(this.alertOverlay, 'ALERT');
    //console.log(this.regularOverlay);
  }
}
