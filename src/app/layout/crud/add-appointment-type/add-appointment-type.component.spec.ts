import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAppointmentTypeComponent } from './add-appointment-type.component';

describe('AddAppointmentTypeComponent', () => {
  let component: AddAppointmentTypeComponent;
  let fixture: ComponentFixture<AddAppointmentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAppointmentTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAppointmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
