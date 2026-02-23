import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking/booking.service';
import { BookingResponseDto } from '../../models/DTOs/api-respose';
import { BookingStatus } from '../../models/booking-status';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-list.html',
  styleUrls: ['./booking-list.css'],
})
export class BookingList implements OnInit {
  private bookingService = inject(BookingService);
  private cdr = inject(ChangeDetectorRef);

  allBookings: BookingResponseDto[] = [];
  filteredBookings: BookingResponseDto[] = [];
  loading = true;
  error = '';

  searchQuery = '';
  filterStatus: BookingStatus | 'ALL' = 'ALL';

  // Detail panel
  selectedBooking: BookingResponseDto | null = null;

  // Delete
  deleteConfirmId: number | null = null;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.allBookings = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load bookings.';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredBookings = this.allBookings.filter((b) => {
      const matchSearch = !q || b.pnr?.toLowerCase().includes(q);
      const matchStatus = this.filterStatus === 'ALL' || b.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  setStatusFilter(status: BookingStatus | 'ALL'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  selectBooking(booking: BookingResponseDto): void {
    this.selectedBooking = this.selectedBooking?.bookingId === booking.bookingId ? null : booking;
  }

  confirmBooking(pnr: string): void {
    this.bookingService.confirmBooking(pnr).subscribe({
      next: () => { this.selectedBooking = null; this.loadBookings(); },
      error: (err) => console.error(err),
    });
  }

  cancelBooking(pnr: string): void {
    this.bookingService.cancelBooking(pnr).subscribe({
      next: () => { this.selectedBooking = null; this.loadBookings(); },
      error: (err) => console.error(err),
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteBooking(id: number): void {
    this.bookingService.deleteBooking(id).subscribe({
      next: () => { this.deleteConfirmId = null; this.selectedBooking = null; this.loadBookings(); },
      error: (err) => console.error(err),
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'chip--green',
      HELD:      'chip--amber',
      CANCELLED: 'chip--red',
      EXPIRED:   'chip--red',
    };
    return map[status] ?? '';
  }

  isHoldExpired(booking: BookingResponseDto): boolean {
    if (!booking.holdExpiresAt) return false;
    return new Date(booking.holdExpiresAt) < new Date();
  }

  get countByStatus() {
    return {
      ALL:       this.allBookings.length,
      CONFIRMED: this.allBookings.filter(b => b.status === 'CONFIRMED').length,
      HELD:      this.allBookings.filter(b => b.status === 'HELD').length,
      CANCELLED: this.allBookings.filter(b => b.status === 'CANCELLED').length,
      EXPIRED:   this.allBookings.filter(b => b.status === 'EXPIRED').length,
    };
  }
}