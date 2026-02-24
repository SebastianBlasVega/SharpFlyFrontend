import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AircraftSoapService, AircraftSoap } from '../../services/aircraft-soap.service';

@Component({
  selector: 'app-aircraft-soap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aircraft-soap-list.html',
  styleUrls: ['./aircraft-soap-list.css'],
})
export class AircraftSoapList implements OnInit {
  private soapService = inject(AircraftSoapService);
  private cdr         = inject(ChangeDetectorRef);

  allAircraft: AircraftSoap[]      = [];
  filteredAircraft: AircraftSoap[] = [];
  loading = true;
  error   = '';
  searchQuery = '';

  ngOnInit(): void {
    this.loadAircraft();
  }

  loadAircraft(): void {
    this.loading = true;
    this.error   = '';

    this.soapService.getAllAircraft().subscribe({
      next: (data) => {
        this.allAircraft     = data;
        this.filteredAircraft = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error   = 'Failed to load aircraft via SOAP.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredAircraft = this.allAircraft.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q)
    );
  }

  get activeCount()   { return this.allAircraft.filter(a =>  a.isActive).length; }
  get inactiveCount() { return this.allAircraft.filter(a => !a.isActive).length; }
}