import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/ui/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/login/login/login').then((m) => m.Login),
      },
      {
        path: 'products',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/products/products/products').then((m) => m.Products),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
