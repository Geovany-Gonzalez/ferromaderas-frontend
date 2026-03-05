import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'ferromaderas_token';
const USER_KEY = 'ferromaderas_user';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'vendedor' | 'administrador' | 'gerente' | 'editor';
  permissions: string[];
}

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  private token = signal<string | null>(this.loadToken());
  private userData = signal<AuthUser | null>(this.loadUser());

  currentUser = computed(() => this.userData());
  isAuthenticated = computed(() => !!this.token());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, { username, password })
      .pipe(
        timeout(8000),
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          localStorage.setItem('ferromaderas_admin_user', res.user.name);
          this.token.set(res.access_token);
          this.userData.set(res.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.userData.set(null);
    this.router.navigate(['/admin-login']);
  }

  getToken(): string | null {
    return this.token();
  }

  hasPermission(slug: string): boolean {
    const perms = this.userData()?.permissions ?? [];
    return perms.includes(slug);
  }

  hasRole(role: string): boolean {
    return this.userData()?.role === role;
  }

  refreshMe(): Observable<AuthUser | null> {
    const t = this.getToken();
    if (!t) return of(null);
    return this.http.get<{ user: AuthUser | null }>(`${this.api}/me`).pipe(
      tap((res) => {
        if (res.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.userData.set(res.user);
        } else {
          this.logout();
        }
      }),
      map((res) => res.user),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.api}/forgot-password`, {
        email: email.trim().toLowerCase(),
      })
      .pipe(timeout(15000));
  }

  initFromStorage(): void {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    this.token.set(t);
    this.userData.set(u ? JSON.parse(u) : null);
  }
}
