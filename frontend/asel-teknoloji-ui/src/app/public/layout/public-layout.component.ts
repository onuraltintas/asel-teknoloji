import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Setting, Service } from '../../core/models/models';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-layout.component.html'
})
export class PublicLayoutComponent implements OnInit {
  private api      = inject(ApiService);
  private document = inject(DOCUMENT);
  setting: Setting | null = null;
  footerServices: Service[] = [];
  get companyName() { return this.setting?.title?.split(' | ')[0] ?? 'Asel Teknoloji'; }
  menuOpen     = false;
  kurumsalOpen = false;
  year = new Date().getFullYear();
  private _closeTimer: any;

  openKurumsal()  { clearTimeout(this._closeTimer); this.kurumsalOpen = true; }
  closeKurumsal() { this._closeTimer = setTimeout(() => this.kurumsalOpen = false, 150); }

  ngOnInit() {
    this.api.getSetting().subscribe({
      next: s => {
        this.setting = s;
        if (s.faviconUrl) {
          let link = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (!link) {
            link = this.document.createElement('link');
            link.rel = 'icon';
            this.document.head.appendChild(link);
          }
          link.href = s.faviconUrl;
        }
      },
      error: () => {}
    });
    this.api.getServices().subscribe({
      next: services => { this.footerServices = services.filter(s => s.isActive).slice(0, 6); },
      error: () => {}
    });
  }
}
