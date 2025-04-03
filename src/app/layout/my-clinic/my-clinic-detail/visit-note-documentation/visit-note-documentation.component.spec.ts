import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitNoteDocumentationComponent } from './visit-note-documentation.component';

describe('VisitNoteDocumentationComponent', () => {
  let component: VisitNoteDocumentationComponent;
  let fixture: ComponentFixture<VisitNoteDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisitNoteDocumentationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VisitNoteDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
