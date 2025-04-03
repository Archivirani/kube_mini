import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsulationDetailsComponent } from './add-consulation-details.component';

describe('AddConsulationDetailsComponent', () => {
  let component: AddConsulationDetailsComponent;
  let fixture: ComponentFixture<AddConsulationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConsulationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddConsulationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
