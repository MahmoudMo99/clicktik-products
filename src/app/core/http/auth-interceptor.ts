import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';

const AUTH_ENDPOINTS = [`${API_BASE_URL}/auth/login`, `${API_BASE_URL}/auth/refresh`];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  const token = authService.accessToken();
  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const isAuthRequest = AUTH_ENDPOINTS.some((url) => request.url.startsWith(url));
  if (!token || !isApiRequest || isAuthRequest) {
    return next(request);
  }

  const authRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authRequest);
};
