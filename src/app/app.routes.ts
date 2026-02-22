import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Layout } from './components/layout/layout';
import { Dashboard } from './components/dashboard/dashboard';
import { FlightList } from './components/flight-list/flight-list';
import { BookingList } from './components/booking-list/booking-list';
import { BookingForm } from './components/booking-form/booking-form';
import { AirportList } from './components/airport-list/airport-list';
import { AircraftList } from './components/aircraft-list/aircraft-list';
import { authGuard } from './security/auth.guard';

export const routes: Routes = [
  // Ruta pública
  { path: 'login', component: Login },

  // Rutas protegidas dentro del Layout (sidebar)
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: Dashboard },
      { path: 'flight-list',   component: FlightList },
      { path: 'booking-list',  component: BookingList },
      { path: 'booking-form',  component: BookingForm },
      { path: 'airport-list',  component: AirportList },
      { path: 'aircraft-list', component: AircraftList },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'login' }
];