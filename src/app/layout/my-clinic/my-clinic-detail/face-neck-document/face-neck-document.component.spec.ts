import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceNeckDocumentComponent } from './face-neck-document.component';

describe('FaceNeckDocumentComponent', () => {
  let component: FaceNeckDocumentComponent;
  let fixture: ComponentFixture<FaceNeckDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceNeckDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceNeckDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
