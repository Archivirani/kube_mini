import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintVisitnoteComponent } from './print-visitnote.component';

describe('PrintVisitnoteComponent', () => {
  let component: PrintVisitnoteComponent;
  let fixture: ComponentFixture<PrintVisitnoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintVisitnoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintVisitnoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
