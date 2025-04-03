import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPatientPopupComponent } from './search-patient-popup.component';

describe('SearchPatientPopupComponent', () => {
  let component: SearchPatientPopupComponent;
  let fixture: ComponentFixture<SearchPatientPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPatientPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchPatientPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
