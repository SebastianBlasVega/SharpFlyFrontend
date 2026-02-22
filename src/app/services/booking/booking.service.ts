import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingStatus } from '../../models/booking-status';
import { BookingRequestDto } from '../../models/DTOs/api-respose';
import { BookingResponseDto } from '../../models/DTOs/api-respose';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.sharpfly.jeremiasamador.com/api/v1/bookings';

  // POST /
  createBooking(request: BookingRequestDto): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(this.apiUrl, request);
  }

  // POST /quick?flightInstanceId=...&passengerCount=...&userId=...&holdMinutes=...
  createQuickBooking(
    flightInstanceId: number,
    passengerCount: number,
    userId?: number,
    holdMinutes: number = 30
  ): Observable<BookingResponseDto> {
    let params = new HttpParams()
      .set('flightInstanceId', flightInstanceId)
      .set('passengerCount', passengerCount)
      .set('holdMinutes', holdMinutes);

    if (userId !== undefined) {
      params = params.set('userId', userId);
    }

    return this.http.post<BookingResponseDto>(`${this.apiUrl}/quick`, null, { params });
  }

  // GET /{id}
  getBookingById(id: number): Observable<BookingResponseDto> {
    return this.http.get<BookingResponseDto>(`${this.apiUrl}/${id}`);
  }

  // GET /pnr/{pnr}
  getBookingByPnr(pnr: string): Observable<BookingResponseDto> {
    return this.http.get<BookingResponseDto>(`${this.apiUrl}/pnr/${pnr}`);
  }

  // GET /
  getAllBookings(): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(this.apiUrl);
  }

  // GET /flight/{flightInstanceId}
  getBookingsByFlight(flightInstanceId: number): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/flight/${flightInstanceId}`);
  }

  // GET /user/{userId}
  getBookingsByUser(userId: number): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/user/${userId}`);
  }

  // GET /status/{status}
  getBookingsByStatus(status: BookingStatus): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/status/${status}`);
  }

  // GET /expired
  getExpiredBookings(): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/expired`);
  }

  // GET /expiring?minutes=30
  getExpiringBookings(minutes: number = 30): Observable<BookingResponseDto[]> {
    const params = new HttpParams().set('minutes', minutes);
    return this.http.get<BookingResponseDto[]>(`${this.apiUrl}/expiring`, { params });
  }

  // POST /{pnr}/confirm
  confirmBooking(pnr: string): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(`${this.apiUrl}/${pnr}/confirm`, null);
  }

  // POST /{pnr}/cancel
  cancelBooking(pnr: string): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(`${this.apiUrl}/${pnr}/cancel`, null);
  }

  // PUT /{id}
  updateBooking(id: number, request: BookingRequestDto): Observable<BookingResponseDto> {
    return this.http.put<BookingResponseDto>(`${this.apiUrl}/${id}`, request);
  }

  // DELETE /{id}
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /exists/pnr/{pnr}
  existsByPnr(pnr: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/pnr/${pnr}`);
  }

  // GET /count/flight/{flightInstanceId}
  countConfirmedBookings(flightInstanceId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/flight/${flightInstanceId}`);
  }
}