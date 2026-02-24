import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftSoapList } from './aircraft-soap-list';

describe('AircraftSoapList', () => {
  let component: AircraftSoapList;
  let fixture: ComponentFixture<AircraftSoapList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftSoapList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftSoapList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
