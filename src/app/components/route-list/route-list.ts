import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteService } from '../../services/flight/route.service';
import { AirportService } from '../../services/flight/airport.service';
import { Route } from '../../models/route';
import { Airport } from '../../models/airport';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-list.html',
  styleUrls: ['./route-list.css'],
})
export class RouteList implements OnInit {
  private routeService   = inject(RouteService);
  private airportService = inject(AirportService);
  private cdr            = inject(ChangeDetectorRef);

  allRoutes: Route[]       = [];
  filteredRoutes: Route[]  = [];
  airports: Airport[]      = [];
  loading = true;
  error   = '';

  searchQuery  = '';
  filterActive: boolean | undefined = undefined;

  showModal    = false;
  editMode     = false;
  saving       = false;
  deleteConfirmId: number | null = null;

  form: Partial<Route> & { originAirportId?: number; destinationAirportId?: number } = this.emptyForm();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.airportService.getAllAirports(true).subscribe({
      next: (airports) => {
        this.airports = airports;
        this.loadRoutes();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadRoutes(): void {
    this.routeService.getAllRoutes().subscribe({
      next: (data) => {
        this.allRoutes = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load routes.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredRoutes = this.allRoutes.filter((r) => {
      const origin = r.originAirport?.iata?.toLowerCase() ?? '';
      const dest   = r.destinationAirport?.iata?.toLowerCase() ?? '';
      const oCity  = r.originAirport?.city?.toLowerCase() ?? '';
      const dCity  = r.destinationAirport?.city?.toLowerCase() ?? '';
      const matchSearch  = !q || origin.includes(q) || dest.includes(q) || oCity.includes(q) || dCity.includes(q);
      const matchActive  = this.filterActive === undefined || r.isActive === this.filterActive;
      return matchSearch && matchActive;
    });
  }

  setActiveFilter(value: boolean | undefined): void {
    this.filterActive = value;
    this.applyFilters();
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.editMode  = false;
    this.showModal = true;
  }

  openEdit(route: Route): void {
    this.form = {
      ...route,
      originAirportId:      route.originAirport?.airportId,
      destinationAirportId: route.destinationAirport?.airportId,
    };
    this.editMode  = true;
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.saving = false; }

  save(): void {
    if (!this.form.originAirportId || !this.form.destinationAirportId) return;
    if (this.form.originAirportId === this.form.destinationAirportId) return;
    this.saving = true;

    const payload: Route = {
      originAirport:      { airportId: this.form.originAirportId } as Airport,
      destinationAirport: { airportId: this.form.destinationAirportId } as Airport,
      isActive: this.form.isActive ?? true,
    };

    const request$ = this.editMode && this.form.routeId
      ? this.routeService.updateRoute(this.form.routeId, payload)
      : this.routeService.createRoute(payload);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadRoutes(); },
      error: (err) => { console.error(err); this.saving = false; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  deleteRoute(id: number): void {
    this.routeService.deleteRoute(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadRoutes(); },
      error: (err) => console.error(err),
    });
  }

  private emptyForm() {
    return { originAirportId: undefined as number | undefined, destinationAirportId: undefined as number | undefined, isActive: true };
  }

  getAirportLabel(airport?: Airport): string {
    if (!airport) return '---';
    return `${airport.iata} — ${airport.city}`;
  }

  get activeCount()   { return this.allRoutes.filter(r => r.isActive).length; }
  get inactiveCount() { return this.allRoutes.filter(r => !r.isActive).length; }

  sameAirport(): boolean {
    return !!this.form.originAirportId &&
    this.form.originAirportId === this.form.destinationAirportId;
  }
  getAirportIata(id?: number): string {
  if (!id) return '???';
  return this.airports.find(a => a.airportId === id)?.iata ?? '???';
}
}