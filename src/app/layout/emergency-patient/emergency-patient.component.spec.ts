import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyPatientComponent } from './emergency-patient.component';

describe('EmergencyPatientComponent', () => {
  let component: EmergencyPatientComponent;
  let fixture: ComponentFixture<EmergencyPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
