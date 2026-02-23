import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.sharpfly';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/users`;

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.base, user);
  }

  getAllUsers(role?: string): Observable<User[]> {
    const params = role ? new HttpParams().set('role', role) : new HttpParams();
    return this.http.get<User[]>(this.base, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.base}/username/${username}`);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  existsByUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/exists/username/${username}`);
  }
}