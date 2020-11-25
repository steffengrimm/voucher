import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CartService } from '../shared/cart.service';
import { Layout, LayoutStorageService } from '../shared/layout-storage.service';
import { NavigationService } from '../shared/navigation.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements AfterViewInit, OnInit, OnDestroy {
  readonly availableLayouts : Layout[];
  private currentLayout = new BehaviorSubject<Layout>(null);
  readonly currentLayout$ = this.currentLayout.asObservable();

  private layoutSubsciption : Subscription;

  @ViewChild('previewScrollBox') previewScrollBox : ElementRef<HTMLDivElement>;
  @ViewChildren('layoutPreview') layoutPreviewBoxes : QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    private navigationService: NavigationService,
    private layoutStorage: LayoutStorageService,
    private cartService: CartService
  ) {
    this.availableLayouts = layoutStorage.getAllLayouts();
  }

  ngOnInit() {
    this.navigationService.toggleBackward(false);
    this.layoutSubsciption = this.currentLayout.subscribe(layout => {
      this.navigationService.toggleForward(layout !== null);
    });

    this.navigationService.onBeforeNavigationForward = async () => {
      await this.cartService.setLayout(this.currentLayout.value);
      return true;
    }
  }

  ngOnDestroy() {
    this.layoutSubsciption?.unsubscribe();
  }

  ngAfterViewInit(): void {
    console.log("afterviewminit");
    if(this.cartService.hasActiveVoucher && this.cartService.activeVoucher.layoutId) {
      console.log("hasactive");
      setTimeout(() => {
        this.selectLayoutById(this.cartService.activeVoucher.layoutId);
      });
    } else if(this.availableLayouts.length === 1) {
      console.log("length == 1");
      setTimeout(() => {
        this.selectLayout(0);
      });
    } else {
      console.log("none");
      this.scrollIntoViewCentered(0);
    }
  }

  getPreviewForLayout(layout: Layout) {
    return this.layoutStorage.getPreviewForLayout(layout);
  }

  selectLayout(index: number) {
    if(index < 0 || index >= this.layoutPreviewBoxes.length)
      return;
    //this.layoutPreviewBoxes.find((_,i) => i === index).nativeElement.scrollIntoView({behavior:'smooth'});
    this.scrollIntoViewCentered(index);
    this.currentLayout.next(this.availableLayouts[index]);
  }

  private scrollIntoViewCentered(index: number) {
    console.log("scroll into view", index);
    const previewImage = this.layoutPreviewBoxes.find((_,i) => i === index).nativeElement;
    const screenWidth = this.previewScrollBox.nativeElement.clientWidth;
    const imageWidth = previewImage.clientWidth;
    const offsetLeft = imageWidth * (index + 1) - screenWidth / 2;
    this.previewScrollBox.nativeElement.scrollLeft = offsetLeft;
  }

  selectLayoutById(id: string) {
    const key = this.availableLayouts.findIndex(layout => layout.id === id);
    this.selectLayout(key);
  }
}
