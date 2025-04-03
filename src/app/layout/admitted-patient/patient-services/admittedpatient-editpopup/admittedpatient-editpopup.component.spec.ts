import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmittedpatientEditpopupComponent } from './admittedpatient-editpopup.component';

describe('AdmittedpatientEditpopupComponent', () => {
  let component: AdmittedpatientEditpopupComponent;
  let fixture: ComponentFixture<AdmittedpatientEditpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmittedpatientEditpopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmittedpatientEditpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
