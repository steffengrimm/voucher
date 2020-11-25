import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularOverlayComponent } from './regular-overlay.component';

describe('RegularOverlayComponent', () => {
  let component: RegularOverlayComponent<any>;
  let fixture: ComponentFixture<RegularOverlayComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegularOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegularOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
