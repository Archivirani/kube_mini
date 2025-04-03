import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacistHeaderComponent } from './pharmacist-header.component';

describe('PharmacistHeaderComponent', () => {
  let component: PharmacistHeaderComponent;
  let fixture: ComponentFixture<PharmacistHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacistHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmacistHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
