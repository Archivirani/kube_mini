import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAppointmentsPopupComponent } from './patient-appointments-popup.component';

describe('PatientAppointmentsPopupComponent', () => {
  let component: PatientAppointmentsPopupComponent;
  let fixture: ComponentFixture<PatientAppointmentsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAppointmentsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAppointmentsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
