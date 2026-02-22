import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aircraft } from '../../models/aircraft';

@Injectable({
  providedIn: 'root',
})
export class AircraftService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.sharpfly.jeremiasamador.com/api/v1/aircraft';

  // POST /
  createAircraft(aircraft: Aircraft): Observable<Aircraft> {
    return this.http.post<Aircraft>(this.apiUrl, aircraft);
  }

  // GET /{id}
  getAircraftById(id: number): Observable<Aircraft> {
    return this.http.get<Aircraft>(`${this.apiUrl}/${id}`);
  }

  // GET /code/{code}
  getAircraftByCode(code: string): Observable<Aircraft> {
    return this.http.get<Aircraft>(`${this.apiUrl}/code/${code}`);
  }

  // GET /?activeOnly=true|false
  getAllAircraft(activeOnly?: boolean): Observable<Aircraft[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly);
    }
    return this.http.get<Aircraft[]>(this.apiUrl, { params });
  }

  // PUT /{id}
  updateAircraft(id: number, aircraft: Aircraft): Observable<Aircraft> {
    return this.http.put<Aircraft>(`${this.apiUrl}/${id}`, aircraft);
  }

  // DELETE /{id}
  deleteAircraft(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /exists/code/{code}
  existsByCode(code: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/code/${code}`);
  }
}