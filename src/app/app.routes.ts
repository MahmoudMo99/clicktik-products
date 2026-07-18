import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login/login').then((m) => m.Login),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products/products').then((m) => m.Products),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
