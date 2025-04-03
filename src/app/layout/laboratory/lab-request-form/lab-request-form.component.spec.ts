import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabRequestFormComponent } from './lab-request-form.component';

describe('LabRequestFormComponent', () => {
  let component: LabRequestFormComponent;
  let fixture: ComponentFixture<LabRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
