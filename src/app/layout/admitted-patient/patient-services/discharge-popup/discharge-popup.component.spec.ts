import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargePopupComponent } from './discharge-popup.component';

describe('DischargePopupComponent', () => {
  let component: DischargePopupComponent;
  let fixture: ComponentFixture<DischargePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
