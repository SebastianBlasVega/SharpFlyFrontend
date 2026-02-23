import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AircraftService } from '../../services/flight/aircraft.service';
import { Aircraft } from '../../models/aircraft';

@Component({
  selector: 'app-aircraft-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aircraft-list.html',
  styleUrls: ['./aircraft-list.css'],
})
export class AircraftList implements OnInit {
  private aircraftService = inject(AircraftService);
  private cdr = inject(ChangeDetectorRef);

  allAircraft: Aircraft[] = [];
  filteredAircraft: Aircraft[] = [];
  loading = true;
  error = '';

  // Filtros
  searchQuery = '';
  filterActive: boolean | undefined = undefined;

  // Modal
  showModal = false;
  editMode = false;
  saving = false;
  deleteConfirmId: number | null = null;

  form: Partial<Aircraft> = this.emptyForm();

  ngOnInit(): void {
    this.loadAircraft();
  }

  loadAircraft(): void {
    this.loading = true;
    this.aircraftService.getAllAircraft().subscribe({
      next: (data) => {
        this.allAircraft = data;
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load aircraft data.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAircraft = this.allAircraft.filter((a) => {
      const matchesSearch =
        !q ||
        a.code.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q);
      const matchesActive =
        this.filterActive === undefined || a.isActive === this.filterActive;
      return matchesSearch && matchesActive;
    });
  }

  setActiveFilter(value: boolean | undefined): void {
    this.filterActive = value;
    this.applyFilters();
  }

  // CRUD
  openCreate(): void {
    this.form = this.emptyForm();
    this.editMode = false;
    this.showModal = true;
  }

  openEdit(aircraft: Aircraft): void {
    this.form = { ...aircraft };
    this.editMode = true;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving = false;
  }

  save(): void {
    if (!this.form.code || !this.form.model || !this.form.seatCapacity) return;
    this.saving = true;

    const request$ = this.editMode && this.form.aircraftId
      ? this.aircraftService.updateAircraft(this.form.aircraftId, this.form as Aircraft)
      : this.aircraftService.createAircraft(this.form as Aircraft);

    request$.subscribe({
      next: () => {
        this.closeModal();
        this.loadAircraft();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
      },
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteAircraft(id: number): void {
    this.aircraftService.deleteAircraft(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadAircraft();
      },
      error: (err) => console.error(err),
    });
  }

  private emptyForm(): Partial<Aircraft> {
    return { code: '', model: '', seatCapacity: undefined, isActive: true };
  }

  get activeCount(): number {
    return this.allAircraft.filter((a) => a.isActive).length;
  }

  get inactiveCount(): number {
    return this.allAircraft.filter((a) => !a.isActive).length;
  }

  get totalCapacity(): number {
    return this.allAircraft
      .filter((a) => a.isActive)
      .reduce((sum, a) => sum + (a.seatCapacity ?? 0), 0);
  }
}