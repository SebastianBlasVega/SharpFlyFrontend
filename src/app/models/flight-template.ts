import { Route } from './route';
import { Aircraft } from './aircraft';
export interface FlightTemplate {
  flightTemplateId?: number;
  flightNumber: string;   // e.g. LA123
  route: Route;
  aircraft: Aircraft;
  defaultDurationMinutes: number;
  isActive?: boolean;     // default: true
  createdAt?: string;
}