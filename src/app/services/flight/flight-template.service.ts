import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightTemplate } from '../../models/flight-template';
import { environment } from '../../../environments/environment.sharpfly';

@Injectable({
  providedIn: 'root',
})
export class FlightTemplateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/flight-templates`;

  // POST /
  createFlightTemplate(flightTemplate: FlightTemplate): Observable<FlightTemplate> {
    return this.http.post<FlightTemplate>(this.apiUrl, flightTemplate);
  }

  // GET /{id}
  getFlightTemplateById(id: number): Observable<FlightTemplate> {
    return this.http.get<FlightTemplate>(`${this.apiUrl}/${id}`);
  }

  // GET /number/{flightNumber}
  getFlightTemplateByNumber(flightNumber: string): Observable<FlightTemplate> {
    return this.http.get<FlightTemplate>(`${this.apiUrl}/number/${flightNumber}`);
  }

  // GET /?activeOnly=true|false
  getAllFlightTemplates(activeOnly?: boolean): Observable<FlightTemplate[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly);
    }
    return this.http.get<FlightTemplate[]>(this.apiUrl, { params });
  }

  // GET /by-route/{routeId}
  getFlightTemplatesByRoute(routeId: number): Observable<FlightTemplate[]> {
    return this.http.get<FlightTemplate[]>(`${this.apiUrl}/by-route/${routeId}`);
  }

  // GET /by-aircraft/{aircraftId}
  getFlightTemplatesByAircraft(aircraftId: number): Observable<FlightTemplate[]> {
    return this.http.get<FlightTemplate[]>(`${this.apiUrl}/by-aircraft/${aircraftId}`);
  }

  // PUT /{id}
  updateFlightTemplate(id: number, flightTemplate: FlightTemplate): Observable<FlightTemplate> {
    return this.http.put<FlightTemplate>(`${this.apiUrl}/${id}`, flightTemplate);
  }

  // DELETE /{id}
  deleteFlightTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /exists/number/{flightNumber}
  existsByFlightNumber(flightNumber: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/number/${flightNumber}`);
  }
}