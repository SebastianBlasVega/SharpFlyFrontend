import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftList } from './aircraft-list';

describe('AircraftList', () => {
  let component: AircraftList;
  let fixture: ComponentFixture<AircraftList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
