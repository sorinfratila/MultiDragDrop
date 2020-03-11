import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GapTileComponent } from './gap-tile.component';

describe('GapTileComponent', () => {
  let component: GapTileComponent;
  let fixture: ComponentFixture<GapTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GapTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GapTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
