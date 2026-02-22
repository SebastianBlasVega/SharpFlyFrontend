import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError,timeout } from 'rxjs/operators';
import { FlightInstanceService } from '../../services/flight/flight-instance.service';
import { BookingService } from '../../services/booking/booking.service';
import { AirportService } from '../../services/flight/airport.service';
import { AuthService } from '../../services/auth.service';
import { FlightInstance } from '../../models/flight-instance';
import { BookingResponseDto } from '../../models/DTOs/api-respose';
import { Observable } from 'rxjs';
import { Airport } from '../../models/airport';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private flightService = inject(FlightInstanceService);
  private bookingService = inject(BookingService);
  private airportService = inject(AirportService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estado
  loading = true;
  currentTime = new Date();

  // Datos
  upcomingFlights: FlightInstance[] = [];
  recentBookings: BookingResponseDto[] = [];
  totalAirports = 0;

  // Métricas
  stats = {
    totalFlights: 0,
    scheduledFlights: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    heldBookings: 0,
    cancelledBookings: 0,
  };

  get isAdmin(): boolean {
  return this.authService.isAdmin();
}

  ngOnInit(): void {
    this.startClock();
    this.loadDashboardData();
  }

  private startClock(): void {
    setInterval(() => (this.currentTime = new Date()), 1000);
  }

private loadDashboardData(): void {
  const safe = <T>(obs$: Observable<T>, fallback: T): Observable<T> =>
    obs$.pipe(
      timeout(8000),
      catchError(err => {
        console.warn('API call failed or timed out:', err);
        return of(fallback);
      })
    );

  forkJoin({
    upcoming:    safe<FlightInstance[]>(this.flightService.getUpcomingFlights(),    []),
    allFlights:  safe<FlightInstance[]>(this.flightService.getAllFlightInstances(),  []),
    allBookings: safe<BookingResponseDto[]>(this.bookingService.getAllBookings(),    []),
    airports:    safe<Airport[]>(this.airportService.getAllAirports(true),           []),
  }).subscribe({
    next: ({ upcoming, allFlights, allBookings, airports }) => {
      this.upcomingFlights = upcoming.slice(0, 6);
      this.recentBookings  = allBookings.slice(-5).reverse();
      this.totalAirports   = airports.length;
      this.stats.totalFlights      = allFlights.length;
      this.stats.scheduledFlights  = allFlights.filter(f => f.status === 'SCHEDULED').length;
      this.stats.totalBookings     = allBookings.length;
      this.stats.confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED').length;
      this.stats.heldBookings      = allBookings.filter(b => b.status === 'HELD').length;
      this.stats.cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED').length;
      this.loading = false;
    },
    error: (err) => {
      console.error('Dashboard error:', err);
      this.loading = false;
    }
  });
}

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'status--scheduled',
      DELAYED: 'status--delayed',
      CANCELLED: 'status--cancelled',
      DEPARTED: 'status--departed',
      ARRIVED: 'status--arrived',
      CONFIRMED: 'status--confirmed',
      HELD: 'status--held',
      EXPIRED: 'status--cancelled',
    };
    return map[status] ?? '';
  }

  getFlightOrigin(flight: FlightInstance): string {
    return flight.flightTemplate?.route?.originAirport?.iata ?? '---';
  }

  getFlightDestination(flight: FlightInstance): string {
    return flight.flightTemplate?.route?.destinationAirport?.iata ?? '---';
  }

  getFlightNumber(flight: FlightInstance): string {
    return flight.flightTemplate?.flightNumber ?? '------';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}