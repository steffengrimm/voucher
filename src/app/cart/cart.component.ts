import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TokenHandler } from '../app-config/token-handler.service';
import { CartService, Voucher } from '../shared/cart.service';
import { OverlayContent } from '../shared/overlay.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OverlayContent<never> {

  allItems$ : Observable<Voucher[]>
  totalSum$ : Observable<number>

  constructor(private cartService: CartService, private tokenHandler: TokenHandler) {}
  data: never;
  closeEvent: Observable<void>;

  ngOnInit(): void {
    this.allItems$ = this.cartService.readOnlyItems$;
    this.totalSum$ = this.cartService.totalPrice;
  }

  async changeCartItemQuantity(voucherId: string, amount: number) {
    if(!this.tokenHandler.decodedToken.cartIsClosed)
      await this.cartService.changeCartItemQuantity(voucherId, amount);
  }

  async deleteCartItem(voucherId: string) {
    if(!this.tokenHandler.decodedToken.cartIsClosed)
      await this.cartService.deleteCartItem(voucherId);
  }

}
