import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightTemplateService } from '../../services/flight/flight-template.service';
import { RouteService } from '../../services/flight/route.service';
import { AircraftService } from '../../services/flight/aircraft.service';
import { FlightTemplate } from '../../models/flight-template';
import { Route } from '../../models/route';
import { Aircraft } from '../../models/aircraft';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-flight-template-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-template-list.html',
  styleUrls: ['./flight-template-list.css'],
})
export class FlightTemplateList implements OnInit {
  private templateService = inject(FlightTemplateService);
  private routeService    = inject(RouteService);
  private aircraftService = inject(AircraftService);
  private cdr             = inject(ChangeDetectorRef);

  allTemplates: FlightTemplate[]      = [];
  filteredTemplates: FlightTemplate[] = [];
  routes: Route[]                     = [];
  aircrafts: Aircraft[]               = [];
  loading = true;
  error   = '';

  searchQuery  = '';
  filterActive: boolean | undefined = undefined;

  showModal = false;
  editMode  = false;
  saving    = false;
  deleteConfirmId: number | null = null;

  form: Partial<FlightTemplate> & {
    routeId?: number;
    aircraftId?: number;
  } = this.emptyForm();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      routes:    this.routeService.getAllRoutes().pipe(catchError(() => of([]))),
      aircrafts: this.aircraftService.getAllAircraft(true).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ routes, aircrafts }) => {
        this.routes   = routes;
        this.aircrafts = aircrafts;
        this.loadTemplates();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadTemplates(): void {
    this.templateService.getAllFlightTemplates().subscribe({
      next: (data) => {
        this.allTemplates = data.sort((a, b) =>
          (a.flightNumber ?? '').localeCompare(b.flightNumber ?? '')
        );
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load flight templates.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredTemplates = this.allTemplates.filter((t) => {
      const num    = t.flightNumber?.toLowerCase() ?? '';
      const origin = t.route?.originAirport?.iata?.toLowerCase() ?? '';
      const dest   = t.route?.destinationAirport?.iata?.toLowerCase() ?? '';
      const ac     = t.aircraft?.code?.toLowerCase() ?? '';
      const matchSearch = !q || num.includes(q) || origin.includes(q) || dest.includes(q) || ac.includes(q);
      const matchActive = this.filterActive === undefined || t.isActive === this.filterActive;
      return matchSearch && matchActive;
    });
  }

  setActiveFilter(v: boolean | undefined): void {
    this.filterActive = v;
    this.applyFilters();
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.editMode  = false;
    this.showModal = true;
  }

  openEdit(t: FlightTemplate): void {
    this.form = {
      ...t,
      routeId:    t.route?.routeId,
      aircraftId: t.aircraft?.aircraftId,
    };
    this.editMode  = true;
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.saving = false; }

  save(): void {
    if (!this.form.flightNumber || !this.form.routeId || !this.form.aircraftId) return;
    this.saving = true;

    const payload: FlightTemplate = {
      flightNumber:           this.form.flightNumber,
      route:                  { routeId: this.form.routeId } as Route,
      aircraft:               { aircraftId: this.form.aircraftId } as Aircraft,
      defaultDurationMinutes: this.form.defaultDurationMinutes ?? 60,
      isActive:               this.form.isActive ?? true,
    };

    const request$ = this.editMode && this.form.flightTemplateId
      ? this.templateService.updateFlightTemplate(this.form.flightTemplateId, payload)
      : this.templateService.createFlightTemplate(payload);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadTemplates(); },
      error: (err) => { console.error(err); this.saving = false; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void            { this.deleteConfirmId = null; }

  deleteTemplate(id: number): void {
    this.templateService.deleteFlightTemplate(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadTemplates(); },
      error: (err) => console.error(err),
    });
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  }

  getRouteLabel(route?: Route): string {
    if (!route) return '---';
    return `${route.originAirport?.iata ?? '?'} → ${route.destinationAirport?.iata ?? '?'}`;
  }

  private emptyForm() {
    return {
      flightNumber: '',
      routeId:      undefined as number | undefined,
      aircraftId:   undefined as number | undefined,
      defaultDurationMinutes: 120,
      isActive: true,
    };
  }

  get activeCount()   { return this.allTemplates.filter(t => t.isActive).length; }
  get inactiveCount() { return this.allTemplates.filter(t => !t.isActive).length; }
}