import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfilePopupComponent } from './patient-profile-popup.component';

describe('PatientProfilePopupComponent', () => {
  let component: PatientProfilePopupComponent;
  let fixture: ComponentFixture<PatientProfilePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfilePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
