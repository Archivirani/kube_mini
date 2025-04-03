import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDataFilterPopupComponent } from './patient-data-filter-popup.component';

describe('PatientDataFilterPopupComponent', () => {
  let component: PatientDataFilterPopupComponent;
  let fixture: ComponentFixture<PatientDataFilterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDataFilterPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDataFilterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
