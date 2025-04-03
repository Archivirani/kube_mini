import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRelationDetailsComponent } from './add-relation-details.component';

describe('AddRelationDetailsComponent', () => {
  let component: AddRelationDetailsComponent;
  let fixture: ComponentFixture<AddRelationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRelationDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRelationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
