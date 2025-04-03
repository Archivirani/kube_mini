import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyPopupViewComponent } from './weekly-popup-view.component';

describe('WeeklyPopupViewComponent', () => {
  let component: WeeklyPopupViewComponent;
  let fixture: ComponentFixture<WeeklyPopupViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeeklyPopupViewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WeeklyPopupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
