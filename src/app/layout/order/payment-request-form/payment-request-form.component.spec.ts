import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRequestFormComponent } from './payment-request-form.component';

describe('PaymentRequestFormComponent', () => {
  let component: PaymentRequestFormComponent;
  let fixture: ComponentFixture<PaymentRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
