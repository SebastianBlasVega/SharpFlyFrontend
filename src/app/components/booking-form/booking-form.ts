import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { BookingService } from '../../services/booking/booking.service';
import { FlightInstanceService } from '../../services/flight/flight-instance.service';
import { AuthService } from '../../services/auth.service';
import { BookingRequestDto } from '../../models/DTOs/api-respose';
import { PassengerDto } from '../../models/DTOs/api-respose';
import { FlightInstance } from '../../models/flight-instance';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
})
export class BookingForm implements OnInit {
  private bookingService = inject(BookingService);
  private flightService  = inject(FlightInstanceService);
  private authService    = inject(AuthService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private cdr            = inject(ChangeDetectorRef);

  // Flight selection
  flights: FlightInstance[] = [];
  selectedFlight: FlightInstance | null = null;
  loadingFlights = true;
  flightSearch = '';

  // Form state
  saving = false;
  step: 1 | 2 | 3 = 1; // 1: Select flight, 2: Passengers, 3: Confirm

  holdMinutes = 30;
  passengers: PassengerDto[] = [];

  readonly docTypes = ['DNI', 'PASAPORTE', 'CE'];

  ngOnInit(): void {
    this.loadFlights();

    // Si viene con flightId como query param, preseleccionar
    const flightId = this.route.snapshot.queryParams['flightId'];
    if (flightId) {
      this.flightService.getFlightInstanceById(+flightId).subscribe({
        next: (f) => { this.selectedFlight = f; this.step = 2; this.syncPassengers(); },
        error: () => {},
      });
    }
  }

  loadFlights(): void {
    this.flightService.getUpcomingFlights().subscribe({
      next: (data) => {
        this.flights = data.filter(f => f.status === 'SCHEDULED');
        this.loadingFlights = false;
        this.cdr.detectChanges();
      },
      error: () => { 
        this.loadingFlights = false; 
        this.cdr.detectChanges(); 
      },
    });
  }

  get filteredFlights(): FlightInstance[] {
    const q = this.flightSearch.toLowerCase();
    if (!q) return this.flights;
    return this.flights.filter(f =>
      f.flightTemplate?.flightNumber?.toLowerCase().includes(q) ||
      f.flightTemplate?.route?.originAirport?.iata?.toLowerCase().includes(q) ||
      f.flightTemplate?.route?.destinationAirport?.iata?.toLowerCase().includes(q)
    );
  }

  selectFlight(flight: FlightInstance): void {
    this.selectedFlight = flight;
  }

  goToPassengers(): void {
    if (!this.selectedFlight) return;
    this.step = 2;
    this.syncPassengers();
  }

  syncPassengers(): void {
    const count = this.passengers.length;
    const needed = 1;
    if (count < needed) {
      for (let i = count; i < needed; i++) {
        this.passengers.push(this.emptyPassenger());
      }
    }
  }

  addPassenger(): void {
    this.passengers.push(this.emptyPassenger());
  }

  removePassenger(index: number): void {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
    }
  }

  goToConfirm(): void {
    if (!this.passengersValid) return;
    this.step = 3;
  }

  submit(): void {
    if (!this.selectedFlight?.flightInstanceId || this.saving) return;
    this.saving = true;

    const userId = this.getUserId();
    const holdExpiry = new Date(Date.now() + this.holdMinutes * 60000)
    .toISOString()
    .slice(0, 19);
    const request: BookingRequestDto = {
      flightInstanceId: this.selectedFlight.flightInstanceId,
      passengerCount: this.passengers.length,
      createdByUserId: userId ?? undefined,
      holdExpiresAt: holdExpiry,
      passengers: this.passengers,
    };

    this.bookingService.createBooking(request).subscribe({
      next: (booking) => {
        this.router.navigate(['/booking-list'], { queryParams: { pnr: booking.pnr } });
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
      },
    });
  }

  get passengersValid(): boolean {
    return this.passengers.every(
      p => p.firstName.trim() && p.lastName.trim() && p.docType && p.docNumber.trim()
    );
  }

  // Helpers
  getFlightNumber(f: FlightInstance): string { return f.flightTemplate?.flightNumber ?? '---'; }
  getOrigin(f: FlightInstance): string       { return f.flightTemplate?.route?.originAirport?.iata ?? '---'; }
  getDestination(f: FlightInstance): string  { return f.flightTemplate?.route?.destinationAirport?.iata ?? '---'; }
  getOriginCity(f: FlightInstance): string   { return f.flightTemplate?.route?.originAirport?.city ?? ''; }
  getDestCity(f: FlightInstance): string     { return f.flightTemplate?.route?.destinationAirport?.city ?? ''; }
  getAircraft(f: FlightInstance): string     { return f.flightTemplate?.aircraft?.model ?? '---'; }

  private emptyPassenger(): PassengerDto {
    return { firstName: '', lastName: '', docType: 'DNI', docNumber: '' };
  }

  private getUserId(): number | null {
  const token = this.authService.getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.uid ?? null; 
  } catch { return null; }
}
}