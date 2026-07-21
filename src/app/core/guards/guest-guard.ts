import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { getPostLoginRedirectUrl } from '../routing/route-utils';

export const guestGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const returnUrl = route.queryParamMap.get('returnUrl');

  return router.parseUrl(getPostLoginRedirectUrl(returnUrl));
};
