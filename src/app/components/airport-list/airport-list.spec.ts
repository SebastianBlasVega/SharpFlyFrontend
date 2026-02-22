import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportList } from './airport-list';

describe('AirportList', () => {
  let component: AirportList;
  let fixture: ComponentFixture<AirportList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
