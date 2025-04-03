import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmittedPatientDetailsComponent } from './admitted-patient-details.component';

describe('AdmittedPatientDetailsComponent', () => {
  let component: AdmittedPatientDetailsComponent;
  let fixture: ComponentFixture<AdmittedPatientDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmittedPatientDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmittedPatientDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
