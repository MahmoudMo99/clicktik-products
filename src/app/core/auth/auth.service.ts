import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../http/api.config';
import { AuthSession, LoginCredentials, LoginResponse, RefreshTokenResponse } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'clicktik-auth-session';

  private readonly session = signal<AuthSession | null>(this.getStoredSession());

  user = computed(() => this.session()?.user ?? null);
  accessToken = computed(() => this.session()?.accessToken ?? null);
  refreshToken = computed(() => this.session()?.refreshToken ?? null);
  isAuthenticated = computed(() => Boolean(this.accessToken()));

  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.http
      .post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        {
          username: credentials.username,
          password: credentials.password,
          expiresInMins: 30,
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
          expiresInMins: 30,
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
    localStorage.removeItem(this.storageKey);
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
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private getStoredSession(): AuthSession | null {
    const storedSession = localStorage.getItem(this.storageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
