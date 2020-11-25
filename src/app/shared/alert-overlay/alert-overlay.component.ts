import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { OverlayDirective, OverlayOutlet, OverlayService } from '../overlay.service';

@Component({
  selector: 'app-alert-overlay',
  templateUrl: './alert-overlay.component.html',
  styleUrls: ['./alert-overlay.component.scss']
})
export class AlertOverlayComponent<T> implements OverlayOutlet {
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

  ngOnInit(): void {
  }

}
