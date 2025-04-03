import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConfigurationlistComponent } from './add-configurationlist.component';

describe('AddConfigurationlistComponent', () => {
  let component: AddConfigurationlistComponent;
  let fixture: ComponentFixture<AddConfigurationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConfigurationlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddConfigurationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
