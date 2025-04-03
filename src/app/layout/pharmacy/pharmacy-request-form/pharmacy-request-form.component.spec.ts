import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyRequestFormComponent } from './pharmacy-request-form.component';

describe('PharmacyRequestFormComponent', () => {
  let component: PharmacyRequestFormComponent;
  let fixture: ComponentFixture<PharmacyRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacyRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
