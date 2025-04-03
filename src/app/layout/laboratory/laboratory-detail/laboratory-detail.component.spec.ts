import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratoryDetailComponent } from './laboratory-detail.component';

describe('LaboratoryDetailComponent', () => {
  let component: LaboratoryDetailComponent;
  let fixture: ComponentFixture<LaboratoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaboratoryDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaboratoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
