import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

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

  const authRequest = addToken(request, token);

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      const canRefresh =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        Boolean(authService.refreshToken());

      if (!canRefresh) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap((session) => next(addToken(request, session.accessToken))),
        catchError((refreshError: unknown) => {
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
