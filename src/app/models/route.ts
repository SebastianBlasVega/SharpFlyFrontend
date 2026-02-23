import { Airport } from './airport';

export interface Route {
    routeId?: number;
    originAirport?: Airport;
    destinationAirport?: Airport;
    isActive?: boolean;     // default: true
    createdAt?: string;
}
