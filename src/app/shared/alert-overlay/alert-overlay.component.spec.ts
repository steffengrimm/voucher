import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertOverlayComponent } from './alert-overlay.component';

describe('AlertOverlayComponent', () => {
  let component: AlertOverlayComponent;
  let fixture: ComponentFixture<AlertOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertOverlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
