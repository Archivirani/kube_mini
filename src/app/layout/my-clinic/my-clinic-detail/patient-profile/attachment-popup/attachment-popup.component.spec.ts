import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentPopupComponent } from './attachment-popup.component';

describe('AttachmentPopupComponent', () => {
  let component: AttachmentPopupComponent;
  let fixture: ComponentFixture<AttachmentPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
