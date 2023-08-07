import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterInstrumentComponent } from './ajouter-instrument.component';

describe('AjouterInstrumentComponent', () => {
  let component: AjouterInstrumentComponent;
  let fixture: ComponentFixture<AjouterInstrumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterInstrumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjouterInstrumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
