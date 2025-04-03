import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyServiceComponent } from './pharmacy-service.component';

describe('PharmacyServiceComponent', () => {
  let component: PharmacyServiceComponent;
  let fixture: ComponentFixture<PharmacyServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
