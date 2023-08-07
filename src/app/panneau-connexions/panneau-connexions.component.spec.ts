import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanneauConnexionsComponent } from './panneau-connexions.component';

describe('PanneauConnexionsComponent', () => {
  let component: PanneauConnexionsComponent;
  let fixture: ComponentFixture<PanneauConnexionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanneauConnexionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanneauConnexionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
