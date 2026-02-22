export interface Aircraft {
  aircraftId?: number;
  code: string;           // e.g. A320-1
  model: string;          // e.g. Airbus A320
  seatCapacity: number;
  isActive?: boolean;     // default: true
  createdAt?: string;
}