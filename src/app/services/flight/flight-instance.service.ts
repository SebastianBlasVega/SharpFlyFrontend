import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightInstance } from '../../models/flight-instance';
import { FlightStatus } from '../../models/flight-status';
import { environment } from '../../../environments/environment.sharpfly';

@Injectable({
  providedIn: 'root',
})
export class FlightInstanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/flight-instances`;

  // POST /
  createFlightInstance(flightInstance: FlightInstance): Observable<FlightInstance> {
    return this.http.post<FlightInstance>(this.apiUrl, flightInstance);
  }

  // GET /{id}
  getFlightInstanceById(id: number): Observable<FlightInstance> {
    return this.http.get<FlightInstance>(`${this.apiUrl}/${id}`);
  }

  // GET /
  getAllFlightInstances(): Observable<FlightInstance[]> {
    return this.http.get<FlightInstance[]>(this.apiUrl);
  }

  // GET /status/{status}
  getFlightInstancesByStatus(status: FlightStatus): Observable<FlightInstance[]> {
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/status/${status}`);
  }

  // GET /by-date-range?start=...&end=...
  getFlightInstancesByDateRange(start: Date, end: Date): Observable<FlightInstance[]> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/by-date-range`, { params });
  }

  // GET /by-template/{templateId}
  getFlightInstancesByTemplate(templateId: number): Observable<FlightInstance[]> {
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/by-template/${templateId}`);
  }

  // GET /search?originAirportId=...&start=...&end=...
  searchByOriginAirport(
    originAirportId: number,
    start: Date,
    end: Date
  ): Observable<FlightInstance[]> {
    const params = new HttpParams()
      .set('originAirportId', originAirportId)
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/search`, { params });
  }

  // GET /search?originCity=...&destinationCity=...&start=...&end=...
  searchByCities(
    originCity: string,
    destinationCity: string,
    start: Date,
    end: Date
  ): Observable<FlightInstance[]> {
    const params = new HttpParams()
      .set('originCity', originCity)
      .set('destinationCity', destinationCity)
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/search`, { params });
  }

  // GET /upcoming
  getUpcomingFlights(): Observable<FlightInstance[]> {
    return this.http.get<FlightInstance[]>(`${this.apiUrl}/upcoming`);
  }

  // PUT /{id}
  updateFlightInstance(id: number, flightInstance: FlightInstance): Observable<FlightInstance> {
    return this.http.put<FlightInstance>(`${this.apiUrl}/${id}`, flightInstance);
  }

  // PATCH /{id}/status?status=...
  updateStatus(id: number, status: FlightStatus): Observable<FlightInstance> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<FlightInstance>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  // DELETE /{id}
  deleteFlightInstance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}