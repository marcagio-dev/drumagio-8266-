import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineMeterComponent } from './line-meter.component';

describe('LineMeterComponent', () => {
  let component: LineMeterComponent;
  let fixture: ComponentFixture<LineMeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LineMeterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineMeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
