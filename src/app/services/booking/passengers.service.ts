import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Passenger } from '../../models/passenger';
import { environment } from '../../../environments/environment.sharpfly';

@Injectable({
  providedIn: 'root',
})
export class PassengerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/passengers`;

  // POST /
  createPassenger(passenger: Passenger): Observable<Passenger> {
    return this.http.post<Passenger>(this.apiUrl, passenger);
  }

  // GET /{id}
  getPassengerById(id: number): Observable<Passenger> {
    return this.http.get<Passenger>(`${this.apiUrl}/${id}`);
  }

  // GET /booking/{bookingId}
  getPassengersByBooking(bookingId: number): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${this.apiUrl}/booking/${bookingId}`);
  }

  // GET /count/booking/{bookingId}
  countPassengersByBooking(bookingId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/booking/${bookingId}`);
  }

  // GET /search/doc/{docNumber}
  getPassengersByDocNumber(docNumber: string): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${this.apiUrl}/search/doc/${docNumber}`);
  }

  // PUT /{id}
  updatePassenger(id: number, passenger: Passenger): Observable<Passenger> {
    return this.http.put<Passenger>(`${this.apiUrl}/${id}`, passenger);
  }

  // DELETE /{id}
  deletePassenger(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}