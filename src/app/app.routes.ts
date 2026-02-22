import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { authGuard } from './security/auth.guard';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { AircraftList } from './components/aircraft-list/aircraft-list';
import { FlightList } from './components/flight-list/flight-list';
import { BookingList } from './components/booking-list/booking-list';
import { BookingForm } from './components/booking-form/booking-form';
import { AirportList } from './components/airport-list/airport-list';

export const routes: Routes = [
    { 
        path: '',
        redirectTo: 'login',
        pathMatch: 'full' 
    },
    {
        path: 'login', 
        component: Login 
    },
    { 
        path: 'home',
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: 'aircraft-list',
        component: AircraftList,
        canActivate: [authGuard]
    },
    {
        path: 'flight-list',
        component: FlightList,
        canActivate: [authGuard]
    },
    {
        path: 'booking-list',
        component: BookingList,
        canActivate: [authGuard]
    },
    {
        path: 'booking-form',
        component: BookingForm,
        canActivate: [authGuard]
    },
    {
        path: 'airport-list',
        component: AirportList,
        canActivate: [authGuard]
    }

];