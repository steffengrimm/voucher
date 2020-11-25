import { Component, OnInit } from '@angular/core';
import { ActivationEnd, Data, Router } from '@angular/router';
import { ArgumentOutOfRangeError, BehaviorSubject, Observable } from 'rxjs';
import { filter, map, reduce, scan, tap } from 'rxjs/operators';
import { CartComponent } from '../cart/cart.component';
import { ContactComponent } from '../contact/contact.component';
import { ImprintComponent } from '../imprint/imprint.component';
import { CartService } from '../shared/cart.service';
import { OverlayService } from '../shared/overlay.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  title$ : BehaviorSubject<string> = new BehaviorSubject("");
  progress$ : BehaviorSubject<boolean[]> = new BehaviorSubject([false]);
  numberOfVouchers$: Observable<number>;

  constructor(private router: Router, private overlayService: OverlayService<any>, private cartService: CartService) {
    this.router.events.pipe(filter(event => event instanceof ActivationEnd),scan<ActivationEnd,Data>((aggr, event) => ({...aggr, ...event.snapshot.data}),{})).subscribe(data => {
      this.title$.next(data.title)

      const progress : boolean[] = [];
      for(let p = 0; p < data.progress[1]; p++) {
        progress.push(p < data.progress[0])
      }
      this.progress$.next(progress);
    });
  }

  ngOnInit() {
    this.numberOfVouchers$ = this.cartService.numberOfVouchers;
  }

  openImpressum() {
    this.overlayService.openOverlay('REGULAR', ImprintComponent, 'DISCLAIMER')
  }

  openCart() {
    this.overlayService.openOverlay('REGULAR', CartComponent);
  }

  openContact() {
    this.overlayService.openOverlay('REGULAR', ContactComponent);
  }

}
