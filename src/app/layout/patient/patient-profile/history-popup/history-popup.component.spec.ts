import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPopupComponent } from './history-popup.component';

describe('HistoryPopupComponent', () => {
  let component: HistoryPopupComponent;
  let fixture: ComponentFixture<HistoryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
