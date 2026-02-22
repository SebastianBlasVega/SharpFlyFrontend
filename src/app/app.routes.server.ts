import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Client 
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'aircraft-list',
    renderMode: RenderMode.Client
  },
  {
    path: 'flight-list',
    renderMode: RenderMode.Client
  },
  {
    path: 'booking-list',
    renderMode: RenderMode.Client
  },
  {
    path: 'booking-form',
    renderMode: RenderMode.Client
  },
  {
    path: 'airport-list',
    renderMode: RenderMode.Client
  }
];