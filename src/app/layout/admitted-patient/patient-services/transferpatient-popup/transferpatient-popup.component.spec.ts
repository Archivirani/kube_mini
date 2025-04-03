import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferpatientPopupComponent } from './transferpatient-popup.component';

describe('TransferpatientPopupComponent', () => {
  let component: TransferpatientPopupComponent;
  let fixture: ComponentFixture<TransferpatientPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferpatientPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferpatientPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
