import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyServiceComponent } from './radiology-service.component';

describe('RadiologyServiceComponent', () => {
  let component: RadiologyServiceComponent;
  let fixture: ComponentFixture<RadiologyServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
