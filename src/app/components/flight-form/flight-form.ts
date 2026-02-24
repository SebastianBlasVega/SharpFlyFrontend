import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightInstanceService } from '../../services/flight/flight-instance.service';
import { FlightTemplateService } from '../../services/flight/flight-template.service';
import { FlightTemplate } from '../../models/flight-template';
import { FlightStatus } from '../../models/flight-status';

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './flight-form.html',
  styleUrls: ['./flight-form.css'],
})
export class FlightForm implements OnInit {
  private flightInstanceService = inject(FlightInstanceService);
  private flightTemplateService = inject(FlightTemplateService);
  private router                = inject(Router);
  private cdr                   = inject(ChangeDetectorRef);

  // Steps: 1 = Select Template, 2 = Schedule, 3 = Confirm
  step: 1 | 2 | 3 = 1;

  templates: FlightTemplate[] = [];
  filteredTemplates: FlightTemplate[] = [];
  templateSearch = '';
  loadingTemplates = true;

  selectedTemplate: FlightTemplate | null = null;

  // Form fields
  departureDate = '';
  departureTime = '';
  capacity: number | null = null;
  status: FlightStatus = 'SCHEDULED';

  saving = false;
  error  = '';

  readonly statuses: FlightStatus[] = ['SCHEDULED', 'DELAYED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadTemplates();
    // Default date = tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.departureDate = tomorrow.toISOString().split('T')[0];
    this.departureTime = '08:00';
  }

  loadTemplates(): void {
    this.flightTemplateService.getAllFlightTemplates(true).subscribe({
      next: (data) => {
        this.templates = data;
        this.filteredTemplates = data;
        this.loadingTemplates = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadingTemplates = false;
        this.cdr.detectChanges();
      },
    });
  }

  filterTemplates(): void {
    const q = this.templateSearch.toLowerCase();
    this.filteredTemplates = this.templates.filter(t =>
      t.flightNumber?.toLowerCase().includes(q) ||
      t.route?.originAirport?.iata?.toLowerCase().includes(q) ||
      t.route?.destinationAirport?.iata?.toLowerCase().includes(q) ||
      t.aircraft?.model?.toLowerCase().includes(q)
    );
  }

  selectTemplate(t: FlightTemplate): void {
    this.selectedTemplate = t;
    // Auto-fill capacity from aircraft
    this.capacity = t.aircraft?.seatCapacity ?? null;
  }

  goToSchedule(): void {
    if (!this.selectedTemplate) return;
    this.step = 2;
  }

  goToConfirm(): void {
    if (!this.scheduleValid) return;
    this.step = 3;
  }

  get arrivalDateTime(): Date | null {
    if (!this.departureDate || !this.departureTime || !this.selectedTemplate) return null;
    const dep = new Date(`${this.departureDate}T${this.departureTime}:00`);
    const minutes = this.selectedTemplate.defaultDurationMinutes ?? 0;
    return new Date(dep.getTime() + minutes * 60000);
  }

  get scheduleValid(): boolean {
    return !!this.departureDate &&
    !!this.departureTime &&
    !!this.capacity &&
    this.capacity > 0 &&
    (this.capacity <= (this.selectedTemplate?.aircraft?.seatCapacity ?? 9999));
  }

  submit(): void {
    if (!this.selectedTemplate?.flightTemplateId || !this.arrivalDateTime || this.saving) return;
    this.saving = true;

    const departureAt = `${this.departureDate}T${this.departureTime}:00`;
    const arrivalAt   = this.arrivalDateTime.toISOString().slice(0, 19);

    const payload = {
      flightTemplate: { flightTemplateId: this.selectedTemplate.flightTemplateId },
      departureAt,
      arrivalAt,
      status: this.status,
      capacity: this.capacity,
    };

    this.flightInstanceService.createFlightInstance(payload as any).subscribe({
      next: () => this.router.navigate(['/flight-list']),
      error: (err) => {
        console.error(err);
        this.error = 'Failed to create flight. Please try again.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Helpers
  getOrigin(t: FlightTemplate): string      { return t.route?.originAirport?.iata ?? '???'; }
  getDestination(t: FlightTemplate): string { return t.route?.destinationAirport?.iata ?? '???'; }
  getOriginCity(t: FlightTemplate): string  { return t.route?.originAirport?.city ?? ''; }
  getDestCity(t: FlightTemplate): string    { return t.route?.destinationAirport?.city ?? ''; }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  }

  statusClass(s: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'chip--blue', DELAYED: 'chip--amber', CANCELLED: 'chip--red',
    };
    return map[s] ?? '';
  }
}