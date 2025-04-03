import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyDetailComponent } from './radiology-detail.component';

describe('RadiologyDetailComponent', () => {
  let component: RadiologyDetailComponent;
  let fixture: ComponentFixture<RadiologyDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
