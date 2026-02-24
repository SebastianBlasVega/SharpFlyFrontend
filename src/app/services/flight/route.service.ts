import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from '../../models/route';
import { environment } from '../../../environments/environment.sharpfly';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/routes`;

  // POST /
  createRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, route);
  }

  // GET /{id}
  getRouteById(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
  }

  // GET /by-airports?originId=...&destinationId=...
  getRouteByOriginAndDestination(originId: number, destinationId: number): Observable<Route> {
    const params = new HttpParams()
      .set('originId', originId)
      .set('destinationId', destinationId);
    return this.http.get<Route>(`${this.apiUrl}/by-airports`, { params });
  }

  // GET /?activeOnly=true|false
  getAllRoutes(activeOnly?: boolean): Observable<Route[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly);
    }
    return this.http.get<Route[]>(this.apiUrl, { params });
  }

  // GET /by-origin/{originId}
  getRoutesByOrigin(originId: number): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/by-origin/${originId}`);
  }

  // GET /by-destination/{destId}
  getRoutesByDestination(destId: number): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/by-destination/${destId}`);
  }

  // PUT /{id}
  updateRoute(id: number, route: Route): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/${id}`, route);
  }

  // DELETE /{id}
  deleteRoute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /exists?originId=...&destinationId=...
  existsRoute(originId: number, destinationId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('originId', originId)
      .set('destinationId', destinationId);
    return this.http.get<boolean>(`${this.apiUrl}/exists`, { params });
  }
}