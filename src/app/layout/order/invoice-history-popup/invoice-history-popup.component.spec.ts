import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceHistoryPopupComponent } from './invoice-history-popup.component';

describe('InvoiceHistoryPopupComponent', () => {
  let component: InvoiceHistoryPopupComponent;
  let fixture: ComponentFixture<InvoiceHistoryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceHistoryPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
