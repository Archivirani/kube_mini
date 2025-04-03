import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCommentPopupComponent } from './edit-comment-popup.component';

describe('EditCommentPopupComponent', () => {
  let component: EditCommentPopupComponent;
  let fixture: ComponentFixture<EditCommentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCommentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCommentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
