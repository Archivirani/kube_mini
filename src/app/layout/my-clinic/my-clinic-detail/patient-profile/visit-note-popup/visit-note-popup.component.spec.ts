import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitNotePopupComponent } from './visit-note-popup.component';

describe('VisitNotePopupComponent', () => {
  let component: VisitNotePopupComponent;
  let fixture: ComponentFixture<VisitNotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitNotePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitNotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
