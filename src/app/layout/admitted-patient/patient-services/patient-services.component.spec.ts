import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientServicesComponent } from './patient-services.component';

describe('PatientServicesComponent', () => {
  let component: PatientServicesComponent;
  let fixture: ComponentFixture<PatientServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
