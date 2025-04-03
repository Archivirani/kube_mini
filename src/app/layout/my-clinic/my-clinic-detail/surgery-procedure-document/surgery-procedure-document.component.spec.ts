import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryProcedureDocumentComponent } from './surgery-procedure-document.component';

describe('SurgeryProcedureDocumentComponent', () => {
  let component: SurgeryProcedureDocumentComponent;
  let fixture: ComponentFixture<SurgeryProcedureDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurgeryProcedureDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurgeryProcedureDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
