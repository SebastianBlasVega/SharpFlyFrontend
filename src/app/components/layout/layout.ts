import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css'],
})
export class Layout {
  public authService = inject(AuthService);
  private router = inject(Router);

  collapsed = false;
  currentRoute = '';

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',             route: '/dashboard' },
    { label: 'Vuelos',    icon: 'departure_board',       route: '/flight-list' },
    { label: 'Reservas',   icon: 'confirmation_number',   route: '/booking-list' },
    { label: 'Aeropuertos',   icon: 'location_city',         route: '/airport-list',  adminOnly: true },
    { label: 'Aeronaves',   icon: 'airplanemode_active',   route: '/aircraft-list', adminOnly: true },
    { label: 'Rutas',     icon: 'compare_arrows',        route: '/route-list',    adminOnly: true },
    { label: 'Plantillas de Vuelo',  icon: 'flight_takeoff',        route: '/flight-template-list', adminOnly: true },
    { label: 'Usuarios',      icon: 'people',                route: '/user-list',     adminOnly: true },
  ];

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => (this.currentRoute = e.urlAfterRedirects));

    this.currentRoute = this.router.url;
  }

  get isAdmin(): boolean {
  return this.authService.isAdmin();
}

  get visibleItems(): NavItem[] {
    return this.navItems.filter(item => !item.adminOnly || this.isAdmin);
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}