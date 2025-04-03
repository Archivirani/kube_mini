import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateConfigurationlistComponent } from './update-configurationlist.component';

describe('UpdateConfigurationlistComponent', () => {
  let component: UpdateConfigurationlistComponent;
  let fixture: ComponentFixture<UpdateConfigurationlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateConfigurationlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateConfigurationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
