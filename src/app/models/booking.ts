import { BookingStatus } from "./booking-status";
import { Passenger } from "./passenger";
export interface Booking {
  bookingId?: number;
  pnr?: string;                  // Lo genera el backend (e.g. AB12CD)
  flightInstanceId: number;      // ID externo al flight-service
  status?: BookingStatus;        // default: HELD
  holdExpiresAt?: string;
  passengerCount: number;
  createdByUserId?: number;      // ID externo al auth-service
  createdAt?: string;
  passengers?: Passenger[];
}