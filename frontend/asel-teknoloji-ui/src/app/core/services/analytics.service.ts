import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

declare function gtag(...args: unknown[]): void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router     = inject(Router);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        if (typeof gtag === 'undefined') return;
        gtag('config', environment.ga4Id, {
          page_path: e.urlAfterRedirects
        });
      });
  }

  trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, params);
  }
}
