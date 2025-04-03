import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataMaintenanceComponent } from './data-maintenance.component';

describe('DataMaintenanceComponent', () => {
  let component: DataMaintenanceComponent;
  let fixture: ComponentFixture<DataMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataMaintenanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
