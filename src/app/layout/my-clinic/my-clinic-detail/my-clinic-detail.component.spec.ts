import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyClinicDetailComponent } from './my-clinic-detail.component';

describe('MyClinicDetailComponent', () => {
  let component: MyClinicDetailComponent;
  let fixture: ComponentFixture<MyClinicDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyClinicDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyClinicDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
