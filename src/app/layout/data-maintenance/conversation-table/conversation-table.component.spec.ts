import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationTableComponent } from './conversation-table.component';

describe('ConversationTableComponent', () => {
  let component: ConversationTableComponent;
  let fixture: ComponentFixture<ConversationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConversationTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
