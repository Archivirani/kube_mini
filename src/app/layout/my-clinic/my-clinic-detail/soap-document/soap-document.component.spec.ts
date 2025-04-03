import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoapDocumentComponent } from './soap-document.component';

describe('SoapDocumentComponent', () => {
  let component: SoapDocumentComponent;
  let fixture: ComponentFixture<SoapDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoapDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoapDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
