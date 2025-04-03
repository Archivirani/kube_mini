import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmittedPatientComponent } from './admitted-patient.component';

describe('AdmittedPatientComponent', () => {
  let component: AdmittedPatientComponent;
  let fixture: ComponentFixture<AdmittedPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmittedPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmittedPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
