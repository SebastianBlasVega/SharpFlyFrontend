import { BookingStatus } from '../booking-status';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  code: string;       // 'OK', 'VALIDATION_ERROR', etc.
  data: T;
  timestamp: string;  // Instant → ISO string
}

// BOOKING SERVICE DTOs

export interface PassengerDto {
  firstName: string;
  lastName: string;
  docType: string;    // 'DNI', 'PASSPORT', 'CE', etc.
  docNumber: string;
}

export interface BookingRequestDto {
  flightInstanceId: number;
  passengerCount: number;
  createdByUserId?: number;
  holdExpiresAt?: string;           // LocalDateTime → ISO string
  passengers?: PassengerDto[];
}

export interface BookingResponseDto {
  bookingId: number;
  pnr: string;                      // e.g. AB12CD
  flightInstanceId: number;
  status: BookingStatus;
  holdExpiresAt?: string;
  passengerCount: number;
  createdByUserId?: number;
  createdAt: string;
  passengers: PassengerDto[];
}

// FLIGHT SERVICE DTOs

export interface FlightDto {
  flightId: number;
  code: string;
  origin: string;
  destination: string;
  price: number;
}
