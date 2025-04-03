import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargedPatientsComponent } from './discharged-patients.component';

describe('DischargedPatientsComponent', () => {
  let component: DischargedPatientsComponent;
  let fixture: ComponentFixture<DischargedPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DischargedPatientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargedPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
