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

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  login(dto: LoginDto) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(res => {
        if (this.isBrowser) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY,  res.username);
        }
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null    { return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null; }
  getUsername(): string | null { return this.isBrowser ? localStorage.getItem(this.USER_KEY)  : null; }
  isLoggedIn(): boolean        { return !!this.getToken(); }
}
