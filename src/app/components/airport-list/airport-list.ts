import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportService } from '../../services/flight/airport.service';
import { Airport } from '../../models/airport';

@Component({
  selector: 'app-airport-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './airport-list.html',
  styleUrls: ['./airport-list.css'],
})
export class AirportList implements OnInit {
  private airportService = inject(AirportService);
  private cdr = inject(ChangeDetectorRef);

  allAirports: Airport[] = [];
  filteredAirports: Airport[] = [];
  loading = true;
  error = '';

  searchQuery = '';
  filterActive: boolean | undefined = undefined;

  showModal = false;
  editMode = false;
  saving = false;
  deleteConfirmId: number | null = null;

  form: Partial<Airport> = this.emptyForm();

  ngOnInit(): void {
    this.loadAirports();
  }

  loadAirports(): void {
    this.loading = true;
    this.airportService.getAllAirports().subscribe({
      next: (data) => {
        this.allAirports = data.sort((a, b) => a.iata.localeCompare(b.iata));
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load airports.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAirports = this.allAirports.filter((a) => {
      const matchSearch =
        !q ||
        a.iata.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q);
      const matchActive =
        this.filterActive === undefined || a.isActive === this.filterActive;
      return matchSearch && matchActive;
    });
  }

  setActiveFilter(value: boolean | undefined): void {
    this.filterActive = value;
    this.applyFilters();
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.editMode = false;
    this.showModal = true;
  }

  openEdit(airport: Airport): void {
    this.form = { ...airport };
    this.editMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving = false;
  }

  save(): void {
    if (!this.form.iata || !this.form.name || !this.form.city || !this.form.country || !this.form.timezone) return;
    this.saving = true;

    const request$ = this.editMode && this.form.airportId
      ? this.airportService.updateAirport(this.form.airportId, this.form as Airport)
      : this.airportService.createAirport(this.form as Airport);

    request$.subscribe({
      next: () => { this.closeModal(); this.loadAirports(); },
      error: (err) => { console.error(err); this.saving = false; },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteAirport(id: number): void {
    this.airportService.deleteAirport(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadAirports(); },
      error: (err) => console.error(err),
    });
  }

  private emptyForm(): Partial<Airport> {
    return { iata: '', name: '', city: '', country: '', timezone: '', isActive: true };
  }

  get activeCount()   { return this.allAirports.filter(a => a.isActive).length; }
  get inactiveCount() { return this.allAirports.filter(a => !a.isActive).length; }

  get countries(): string[] {
    return [...new Set(this.allAirports.map(a => a.country))].sort();
  }
}