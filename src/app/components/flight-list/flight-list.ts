import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlightInstanceService } from '../../services/flight/flight-instance.service';
import { FlightInstance } from '../../models/flight-instance';
import { FlightStatus } from '../../models/flight-status';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './flight-list.html',
  styleUrls: ['./flight-list.css'],
})
export class FlightList implements OnInit {
  private flightService = inject(FlightInstanceService);

  allFlights: FlightInstance[] = [];
  filteredFlights: FlightInstance[] = [];
  loading = true;
  error = '';

  // Filtros
  searchQuery = '';
  filterStatus: FlightStatus | 'ALL' = 'ALL';

  // Delete
  deleteConfirmId: number | null = null;

  // Patch status
  patchTarget: FlightInstance | null = null;
  patchStatus: FlightStatus = 'SCHEDULED';
  patching = false;

  readonly statuses: FlightStatus[] = ['SCHEDULED', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED'];

  ngOnInit(): void {
    this.loadFlights();
  }

  loadFlights(): void {
    this.loading = true;
    this.flightService.getAllFlightInstances().subscribe({
      next: (data) => {
        this.allFlights = data.sort(
          (a, b) => new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load flights.';
        console.error(err);
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredFlights = this.allFlights.filter((f) => {
      const flightNum = f.flightTemplate?.flightNumber?.toLowerCase() ?? '';
      const origin = f.flightTemplate?.route?.originAirport?.iata?.toLowerCase() ?? '';
      const dest = f.flightTemplate?.route?.destinationAirport?.iata?.toLowerCase() ?? '';
      const matchSearch = !q || flightNum.includes(q) || origin.includes(q) || dest.includes(q);
      const matchStatus = this.filterStatus === 'ALL' || f.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  setStatusFilter(status: FlightStatus | 'ALL'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  // Patch status modal
  openPatchStatus(flight: FlightInstance): void {
    this.patchTarget = flight;
    this.patchStatus = flight.status ?? 'SCHEDULED';
  }

  closePatch(): void {
    this.patchTarget = null;
    this.patching = false;
  }

  saveStatus(): void {
    if (!this.patchTarget?.flightInstanceId) return;
    this.patching = true;
    this.flightService.updateStatus(this.patchTarget.flightInstanceId, this.patchStatus).subscribe({
      next: () => {
        this.closePatch();
        this.loadFlights();
      },
      error: (err) => {
        console.error(err);
        this.patching = false;
      },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteFlight(id: number): void {
    this.flightService.deleteFlightInstance(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadFlights(); },
      error: (err) => console.error(err),
    });
  }

  // Helpers
  getFlightNumber(f: FlightInstance): string  { return f.flightTemplate?.flightNumber ?? '---'; }
  getOrigin(f: FlightInstance): string        { return f.flightTemplate?.route?.originAirport?.iata ?? '---'; }
  getDestination(f: FlightInstance): string   { return f.flightTemplate?.route?.destinationAirport?.iata ?? '---'; }
  getOriginCity(f: FlightInstance): string    { return f.flightTemplate?.route?.originAirport?.city ?? ''; }
  getDestCity(f: FlightInstance): string      { return f.flightTemplate?.route?.destinationAirport?.city ?? ''; }
  getAircraft(f: FlightInstance): string      { return f.flightTemplate?.aircraft?.code ?? '---'; }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'chip--blue', DELAYED: 'chip--amber',
      CANCELLED: 'chip--red',  DEPARTED: 'chip--green', ARRIVED: 'chip--green',
    };
    return map[status] ?? '';
  }

  get countByStatus() {
    return {
      ALL: this.allFlights.length,
      SCHEDULED: this.allFlights.filter(f => f.status === 'SCHEDULED').length,
      DELAYED:   this.allFlights.filter(f => f.status === 'DELAYED').length,
      CANCELLED: this.allFlights.filter(f => f.status === 'CANCELLED').length,
      DEPARTED:  this.allFlights.filter(f => f.status === 'DEPARTED').length,
      ARRIVED:   this.allFlights.filter(f => f.status === 'ARRIVED').length,
    };
  }
}