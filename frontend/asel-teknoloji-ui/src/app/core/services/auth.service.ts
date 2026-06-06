import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginDto, LoginResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http       = inject(HttpClient);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly TOKEN_KEY = 'asel_token';
  private readonly USER_KEY  = 'asel_user';
  private readonly ROLE_KEY  = 'asel_role';

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  // Önce localStorage, yoksa sessionStorage'a bak
  private read(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private write(key: string, value: string, persistent: boolean): void {
    if (!this.isBrowser) return;
    if (persistent) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  }

  private clear(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  login(dto: LoginDto, rememberMe = false) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(res => {
        this.write(this.TOKEN_KEY, res.token,              rememberMe);
        this.write(this.USER_KEY,  res.username,           rememberMe);
        this.write(this.ROLE_KEY,  res.role ?? 'Admin',    rememberMe);
      })
    );
  }

  logout() {
    this.clear(this.TOKEN_KEY);
    this.clear(this.USER_KEY);
    this.clear(this.ROLE_KEY);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null    { return this.read(this.TOKEN_KEY); }
  getUsername(): string | null { return this.read(this.USER_KEY); }
  getRole(): string | null     { return this.read(this.ROLE_KEY); }
  isLoggedIn(): boolean        { return !!this.getToken(); }
  isSuperAdmin(): boolean      { return this.getRole() === 'SuperAdmin'; }
  isTechnician(): boolean      { return this.getRole() === 'Technician'; }
  isAdminOrAbove(): boolean    { return this.getRole() === 'SuperAdmin' || this.getRole() === 'Admin'; }
}
