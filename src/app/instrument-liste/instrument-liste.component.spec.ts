import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstrumentListeComponent } from './instrument-liste.component';

describe('InstrumentListeComponent', () => {
  let component: InstrumentListeComponent;
  let fixture: ComponentFixture<InstrumentListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstrumentListeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstrumentListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
