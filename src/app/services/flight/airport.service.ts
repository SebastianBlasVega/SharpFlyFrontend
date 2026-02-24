import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airport } from '../../models/airport';
import { environment } from '../../../environments/environment.sharpfly';

@Injectable({
  providedIn: 'root',
})
export class AirportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/airports`;

  // POST /
  createAirport(airport: Airport): Observable<Airport> {
    return this.http.post<Airport>(this.apiUrl, airport);
  }

  // GET /{id}
  getAirportById(id: number): Observable<Airport> {
    return this.http.get<Airport>(`${this.apiUrl}/${id}`);
  }

  // GET /iata/{iata}
  getAirportByIata(iata: string): Observable<Airport> {
    return this.http.get<Airport>(`${this.apiUrl}/iata/${iata}`);
  }

  // GET /?activeOnly=true|false
  getAllAirports(activeOnly?: boolean): Observable<Airport[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly);
    }
    return this.http.get<Airport[]>(this.apiUrl, { params });
  }

  // PUT /{id}
  updateAirport(id: number, airport: Airport): Observable<Airport> {
    return this.http.put<Airport>(`${this.apiUrl}/${id}`, airport);
  }

  // DELETE /{id}
  deleteAirport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /exists/iata/{iata}
  existsByIata(iata: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/iata/${iata}`);
  }
}