import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentPopupComponent } from './appointment-popup.component';

describe('AppointmentPopupComponent', () => {
  let component: AppointmentPopupComponent;
  let fixture: ComponentFixture<AppointmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentPopupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppointmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
