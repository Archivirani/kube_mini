import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesClinicOrderComponent } from './services-clinic-order.component';

describe('ServicesClinicOrderComponent', () => {
  let component: ServicesClinicOrderComponent;
  let fixture: ComponentFixture<ServicesClinicOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicesClinicOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesClinicOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
