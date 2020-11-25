import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfiguration } from '../app-config/app-config.service';
import { ImprintComponent, ImprintTypes } from '../imprint/imprint.component';
import { SocialMedia } from '../shared/dto';
import { OverlayContent, OverlayService } from '../shared/overlay.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, OverlayContent<never> {
  email : string;
  phoneNumber : string;
  socialMedia : {[key in SocialMedia]?: string}

  constructor(private appConfig: AppConfiguration, @Inject(DOCUMENT) private document: Document, private overlayService: OverlayService<ImprintTypes>) { }
  data: never;
  closeEvent: Observable<void>;

  ngOnInit(): void {
    const config = this.appConfig.getConfiguration().location;
    this.email = config.address.locationMail ?? "";
    this.phoneNumber = config.address.locationPhone ?? "";
    this.socialMedia = config.socialMedia ?? {};
  }

  get cleanPhoneNumber() {
    return this.phoneNumber.replace(/[\-\(\) ]/g, '');
  }


  social(type: SocialMedia) {
    let url = "";
    switch(type) {
      case 'fb':
        url = "https://www.facebook.com/";
        break;
      case 'ig':
        url = "https://www.instagram.com/";
        break;
      case 'twitter':
        url = "https://www.twitter.com/";
        break;
    }

    url += this.socialMedia[type];

    window.open(url, '_blank');
  }

  openImprint(imprint: ImprintTypes) {
    this.overlayService.openOverlay('REGULAR', ImprintComponent, imprint);
  }
}
