import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavigationService } from '../shared/navigation.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  canForward$ : Observable<boolean>;
  canBackward$ : Observable<boolean>;
  canStore$ : Observable<boolean>;

  constructor(private navigationService : NavigationService) { }

  ngOnInit(): void {
    this.canForward$ = this.navigationService.canForward$;
    this.canBackward$ = this.navigationService.canBackward$;
    this.canStore$ = this.navigationService.canStore$;
  }

  goForward() {
    this.navigationService.tryGoForward();
  }

  goBackward() {
    this.navigationService.tryGoBackward();
  }
}
