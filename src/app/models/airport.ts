export interface Airport {
  airportId?: number;
  iata: string;           // e.g. LIM, SCL
  name: string;
  city: string;
  country: string;
  timezone: string;       // e.g. America/Lima
  isActive?: boolean;     // default: true
  createdAt?: string;
}