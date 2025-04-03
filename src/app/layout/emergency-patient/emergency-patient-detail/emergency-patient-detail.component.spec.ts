import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyPatientDetailComponent } from './emergency-patient-detail.component';

describe('EmergencyPatientDetailComponent', () => {
  let component: EmergencyPatientDetailComponent;
  let fixture: ComponentFixture<EmergencyPatientDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyPatientDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmergencyPatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
