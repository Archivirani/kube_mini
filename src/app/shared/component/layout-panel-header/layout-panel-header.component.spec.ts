import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPanelHeaderComponent } from './layout-panel-header.component';

describe('LayoutPanelHeaderComponent', () => {
  let component: LayoutPanelHeaderComponent;
  let fixture: ComponentFixture<LayoutPanelHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutPanelHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPanelHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
