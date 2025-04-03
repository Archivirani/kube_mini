import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErRequestFormComponent } from './er-request-form.component';

describe('ErRequestFormComponent', () => {
  let component: ErRequestFormComponent;
  let fixture: ComponentFixture<ErRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
