import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceReadingDocumentComponent } from './face-reading-document.component';

describe('FaceReadingDocumentComponent', () => {
  let component: FaceReadingDocumentComponent;
  let fixture: ComponentFixture<FaceReadingDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceReadingDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceReadingDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
