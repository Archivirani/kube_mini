import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicServicesComponent } from './clinic-services.component';

describe('ClinicServicesComponent', () => {
  let component: ClinicServicesComponent;
  let fixture: ComponentFixture<ClinicServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClinicServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
