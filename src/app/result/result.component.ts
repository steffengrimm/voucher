import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppConfiguration } from '../app-config/app-config.service';
import { TokenHandler } from '../app-config/token-handler.service';
import { CartService } from '../shared/cart.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  email : string;

  constructor(private cartService: CartService, private appService: AppConfiguration, private tokenService: TokenHandler) { }

  ngOnInit(): void {
    this.email = this.cartService.customerEmail;
  }

  getLogo() {
    return this.appService.getLocationAsset('logo.png');
  }

  generatePDFLink() {
    return environment.apiUrl+"pdf/"+this.tokenService.rawToken;
  }
}
