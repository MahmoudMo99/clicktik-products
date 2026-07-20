import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from './api.config';

const AUTH_ENDPOINTS = [`${API_BASE_URL}/auth/login`, `${API_BASE_URL}/auth/refresh`];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  const token = authService.accessToken();

  if (!shouldAttachToken(request, token)) {
    return next(request);
  }

  return next(addToken(request, token)).pipe(
    catchError((error: unknown) => {
      if (!shouldRefreshToken(error, authService)) {
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

function shouldAttachToken(request: HttpRequest<unknown>, token: string | null): token is string {
  const isApiRequest = request.url.startsWith(API_BASE_URL);
  const isAuthRequest = AUTH_ENDPOINTS.some((url) => request.url.startsWith(url));

  return Boolean(token) && isApiRequest && !isAuthRequest;
}

function shouldRefreshToken(error: unknown, authService: AuthService): boolean {
  return (
    error instanceof HttpErrorResponse &&
    error.status === 401 &&
    Boolean(authService.refreshToken())
  );
}

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
