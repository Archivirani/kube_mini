import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataMaintenanceDetailsComponent } from './data-maintenance-details.component';

describe('DataMaintenanceDetailsComponent', () => {
  let component: DataMaintenanceDetailsComponent;
  let fixture: ComponentFixture<DataMaintenanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataMaintenanceDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataMaintenanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
