import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataMaintenanceTableComponent } from './data-maintenance-table.component';

describe('DataMaintenanceTableComponent', () => {
  let component: DataMaintenanceTableComponent;
  let fixture: ComponentFixture<DataMaintenanceTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataMaintenanceTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataMaintenanceTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
