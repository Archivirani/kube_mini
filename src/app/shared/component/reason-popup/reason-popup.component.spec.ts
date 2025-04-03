import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasonPopupComponent } from './reason-popup.component';

describe('ReasonPopupComponent', () => {
  let component: ReasonPopupComponent;
  let fixture: ComponentFixture<ReasonPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReasonPopupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReasonPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
