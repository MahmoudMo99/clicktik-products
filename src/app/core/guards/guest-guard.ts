import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

const DEFAULT_AUTHENTICATED_ROUTE = '/products';

export const guestGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const returnUrl = route.queryParamMap.get('returnUrl');

  return router.parseUrl(getSafeReturnUrl(returnUrl));
};

function getSafeReturnUrl(returnUrl: string | null): string {
  if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  return DEFAULT_AUTHENTICATED_ROUTE;
}
