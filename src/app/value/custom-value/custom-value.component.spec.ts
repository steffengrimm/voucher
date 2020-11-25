import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomValueComponent } from './custom-value.component';

describe('CustomValueComponent', () => {
  let component: CustomValueComponent;
  let fixture: ComponentFixture<CustomValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
