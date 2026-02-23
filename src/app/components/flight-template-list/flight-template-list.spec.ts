import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightTemplateList } from './flight-template-list';

describe('FlightTemplateList', () => {
  let component: FlightTemplateList;
  let fixture: ComponentFixture<FlightTemplateList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightTemplateList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightTemplateList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
