import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDischargePopupComponent } from './edit-discharge-popup.component';

describe('EditDischargePopupComponent', () => {
  let component: EditDischargePopupComponent;
  let fixture: ComponentFixture<EditDischargePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditDischargePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDischargePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
