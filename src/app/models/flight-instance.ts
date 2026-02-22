import { FlightTemplate } from './flight-template';
import { FlightStatus } from './flight-status';
export interface FlightInstance {
  flightInstanceId?: number;
  flightTemplate: FlightTemplate;
  departureAt: string;    // LocalDateTime → ISO string
  arrivalAt: string;
  status?: FlightStatus;  // default: SCHEDULED
  capacity: number;       // capacidad "congelada" por vuelo
  createdAt?: string;
}