import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmitpatientPopupComponent } from './admitpatient-popup.component';

describe('AdmitpatientPopupComponent', () => {
  let component: AdmitpatientPopupComponent;
  let fixture: ComponentFixture<AdmitpatientPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmitpatientPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmitpatientPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
