import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAppointmentDetailsComponent } from './add-appointment-details.component';

describe('AddAppointmentDetailsComponent', () => {
  let component: AddAppointmentDetailsComponent;
  let fixture: ComponentFixture<AddAppointmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAppointmentDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAppointmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
