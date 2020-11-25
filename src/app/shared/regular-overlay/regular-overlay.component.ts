import { Component, HostBinding, ViewChild } from '@angular/core';
import { OverlayDirective, OverlayOutlet, OverlayService } from '../overlay.service';

@Component({
  selector: 'app-regular-overlay',
  templateUrl: './regular-overlay.component.html',
  styleUrls: ['./regular-overlay.component.scss']
})
export class RegularOverlayComponent<T> implements OverlayOutlet {
  @ViewChild(OverlayDirective) overlayHost: OverlayDirective;
  @HostBinding('class.visible') visible : boolean;

  private _overlayIdentifier : string

  constructor(private overlayService: OverlayService<T>) {}
  
  setIdentifier(identifier: string): void {
    this._overlayIdentifier = identifier;
    setTimeout(() => {
      this.overlayService.isVisible(this._overlayIdentifier).subscribe(visible => this.visible = visible);
    },0);
  }

  closeContent() {
    /*this.visible = false;
    this.overlayHost.viewContainerRef.clear();*/
    this.overlayService.closeOverlay(this._overlayIdentifier);
  }

}
