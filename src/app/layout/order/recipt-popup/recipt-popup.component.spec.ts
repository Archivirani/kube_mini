import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReciptPopupComponent } from './recipt-popup.component';

describe('ReciptPopupComponent', () => {
  let component: ReciptPopupComponent;
  let fixture: ComponentFixture<ReciptPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReciptPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReciptPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
