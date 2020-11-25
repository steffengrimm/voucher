import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecoratedInputComponent } from './decorated-input.component';

describe('DecoratedInputComponent', () => {
  let component: DecoratedInputComponent;
  let fixture: ComponentFixture<DecoratedInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecoratedInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecoratedInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
