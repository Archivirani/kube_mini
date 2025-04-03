import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmitpatientRequestFormComponent } from './admitpatient-request-form.component';

describe('AdmitpatientRequestFormComponent', () => {
  let component: AdmitpatientRequestFormComponent;
  let fixture: ComponentFixture<AdmitpatientRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmitpatientRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmitpatientRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
