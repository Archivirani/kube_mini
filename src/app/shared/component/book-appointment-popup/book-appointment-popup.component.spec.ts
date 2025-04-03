import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAppointmentPopupComponent } from './book-appointment-popup.component';

describe('BookAppointmentPopupComponent', () => {
  let component: BookAppointmentPopupComponent;
  let fixture: ComponentFixture<BookAppointmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookAppointmentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookAppointmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
