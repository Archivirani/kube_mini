import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListPopupComponent } from './patient-list-popup.component';

describe('PatientListPopupComponent', () => {
  let component: PatientListPopupComponent;
  let fixture: ComponentFixture<PatientListPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientListPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
