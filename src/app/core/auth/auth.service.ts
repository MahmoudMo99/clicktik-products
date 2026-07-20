import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap, throwError } from 'rxjs';

import { API_BASE_URL } from '../http/api.config';
import { AuthSession, LoginCredentials, LoginResponse, RefreshTokenResponse } from './auth.models';

const AUTH_STORAGE_KEY = 'clicktik-auth-session';
const TOKEN_EXPIRES_IN_MINUTES = 30;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthSession | null>(this.getStoredSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.session()?.refreshToken ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.accessToken()));

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.http
      .post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        {
          username: credentials.username,
          password: credentials.password,
          expiresInMins: TOKEN_EXPIRES_IN_MINUTES,
        },
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => this.createSession(response)),
        tap((session) => this.saveSession(session)),
      );
  }

  refreshAccessToken(): Observable<AuthSession> {
    const currentSession = this.session();

    if (!currentSession?.refreshToken) {
      return throwError(() => new Error('No refresh token available.'));
    }

    return this.http
      .post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken: currentSession.refreshToken,
          expiresInMins: TOKEN_EXPIRES_IN_MINUTES,
        },
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => ({
          ...currentSession,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken ?? currentSession.refreshToken,
        })),
        tap((session) => this.saveSession(session)),
      );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private createSession(response: LoginResponse): AuthSession {
    const { accessToken, refreshToken, ...user } = response;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private saveSession(session: AuthSession): void {
    this.session.set(session);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  private getStoredSession(): AuthSession | null {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      const parsedSession: unknown = JSON.parse(storedSession);

      if (isAuthSession(parsedSession)) {
        return parsedSession;
      }

      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<AuthSession>;

  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    Boolean(session.user) &&
    typeof session.user?.id === 'number' &&
    typeof session.user?.username === 'string'
  );
}
