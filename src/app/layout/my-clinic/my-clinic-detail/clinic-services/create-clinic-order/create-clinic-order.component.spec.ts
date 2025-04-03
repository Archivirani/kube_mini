import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClinicOrderComponent } from './create-clinic-order.component';

describe('CreateClinicOrderComponent', () => {
  let component: CreateClinicOrderComponent;
  let fixture: ComponentFixture<CreateClinicOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateClinicOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateClinicOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
