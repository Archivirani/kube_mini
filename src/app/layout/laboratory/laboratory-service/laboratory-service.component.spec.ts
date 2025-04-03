import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryServiceComponent } from './laboratory-service.component';

describe('LaboratoryServiceComponent', () => {
  let component: LaboratoryServiceComponent;
  let fixture: ComponentFixture<LaboratoryServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
