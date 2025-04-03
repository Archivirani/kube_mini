import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientTypeComponent } from './add-patient-type.component';

describe('AddPatientTypeComponent', () => {
  let component: AddPatientTypeComponent;
  let fixture: ComponentFixture<AddPatientTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPatientTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPatientTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
