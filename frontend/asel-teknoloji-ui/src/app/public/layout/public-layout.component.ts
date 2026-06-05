import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Setting } from '../../core/models/models';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col">

      <!-- ───── NAVBAR ───── -->
      <nav class="bg-blue-900 text-white sticky top-0 z-50 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="flex items-center justify-between h-16">

            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-3 shrink-0">
              @if (setting?.logoUrl) {
                <img [src]="setting!.logoUrl" alt="Asel Teknoloji" class="h-10 w-auto object-contain" />
              } @else {
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">A</div>
                  <span class="font-bold text-lg tracking-tight">Asel Teknoloji</span>
                </div>
              }
            </a>

            <!-- Desktop nav -->
            <div class="hidden md:flex items-center gap-1 text-sm font-medium">
              <a routerLink="/" routerLinkActive="bg-blue-800 text-orange-400"
                 [routerLinkActiveOptions]="{exact:true}"
                 class="px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-orange-400 transition-colors">Ana Sayfa</a>
              <a routerLink="/blog" routerLinkActive="bg-blue-800 text-orange-400"
                 class="px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-orange-400 transition-colors">Blog</a>
              <a routerLink="/referanslar" routerLinkActive="bg-blue-800 text-orange-400"
                 class="px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-orange-400 transition-colors">Referanslar</a>
              <a routerLink="/servis-takip" routerLinkActive="bg-blue-800 text-orange-400"
                 class="px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-orange-400 transition-colors">Servis</a>
              <a routerLink="/iletisim" routerLinkActive="bg-blue-800 text-orange-400"
                 class="px-4 py-2 rounded-lg hover:bg-blue-800 hover:text-orange-400 transition-colors">İletişim</a>
            </div>

            <!-- Phone + mobile toggle -->
            <div class="flex items-center gap-3">
              @if (setting?.phone) {
                <a [href]="'tel:' + setting!.phone"
                   class="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
                  📞 {{ setting!.phone }}
                </a>
              }
              <button (click)="menuOpen = !menuOpen"
                      class="md:hidden p-2 rounded-lg hover:bg-blue-800 transition-colors"
                      aria-label="Menü">
                <div class="w-5 h-0.5 bg-white mb-1 transition-all" [class.rotate-45]="menuOpen" [class.translate-y-1]="menuOpen"></div>
                <div class="w-5 h-0.5 bg-white mb-1 transition-all" [class.opacity-0]="menuOpen"></div>
                <div class="w-5 h-0.5 bg-white transition-all" [class.-rotate-45]="menuOpen" [class.-translate-y-1]="menuOpen"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        @if (menuOpen) {
          <div class="md:hidden border-t border-blue-800 bg-blue-900">
            <div class="px-4 py-3 space-y-1 text-sm">
              <a routerLink="/" (click)="menuOpen=false" class="block px-3 py-2 rounded-lg hover:bg-blue-800">Ana Sayfa</a>
              <a routerLink="/blog" (click)="menuOpen=false" class="block px-3 py-2 rounded-lg hover:bg-blue-800">Blog</a>
              <a routerLink="/referanslar" (click)="menuOpen=false" class="block px-3 py-2 rounded-lg hover:bg-blue-800">Referanslar</a>
              <a routerLink="/servis-takip" (click)="menuOpen=false" class="block px-3 py-2 rounded-lg hover:bg-blue-800">Servis</a>
              <a routerLink="/iletisim" (click)="menuOpen=false" class="block px-3 py-2 rounded-lg hover:bg-blue-800">İletişim</a>
              @if (setting?.phone) {
                <a [href]="'tel:' + setting!.phone" class="block px-3 py-2 text-orange-400 font-semibold">📞 {{ setting!.phone }}</a>
              }
            </div>
          </div>
        }
      </nav>

      <!-- ───── CONTENT ───── -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- ───── FOOTER ───── -->
      <footer class="bg-gray-900 text-gray-400">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <!-- Brand -->
          <div>
            <h3 class="text-white font-bold text-lg mb-3">Asel Teknoloji</h3>
            <p class="text-sm leading-relaxed mb-4">
              {{ setting?.description || 'Güvenlik kamera, yangın alarm, internet altyapı ve teknik servis hizmetleri.' }}
            </p>
            <div class="flex gap-3">
              @if (setting?.facebook) {
                <a [href]="setting!.facebook" target="_blank" rel="noopener"
                   class="w-8 h-8 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-white text-xs transition-colors">f</a>
              }
              @if (setting?.instagram) {
                <a [href]="setting!.instagram" target="_blank" rel="noopener"
                   class="w-8 h-8 bg-pink-700 hover:bg-pink-600 rounded-full flex items-center justify-center text-white text-xs transition-colors">ig</a>
              }
              @if (setting?.linkedin) {
                <a [href]="setting!.linkedin" target="_blank" rel="noopener"
                   class="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white text-xs transition-colors">in</a>
              }
            </div>
          </div>

          <!-- Quick links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Hızlı Linkler</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/" class="hover:text-white transition-colors">Ana Sayfa</a></li>
              <li><a routerLink="/blog" class="hover:text-white transition-colors">Blog</a></li>
              <li><a routerLink="/referanslar" class="hover:text-white transition-colors">Referanslar</a></li>
              <li><a routerLink="/servis-takip" class="hover:text-white transition-colors">Servis</a></li>
              <li><a routerLink="/iletisim" class="hover:text-white transition-colors">İletişim</a></li>
            </ul>
          </div>

          <!-- Services hint -->
          <div>
            <h4 class="text-white font-semibold mb-4">Hizmetlerimiz</h4>
            <ul class="space-y-2 text-sm">
              <li class="hover:text-white transition-colors">Güvenlik Kamera Sistemleri</li>
              <li class="hover:text-white transition-colors">Yangın Alarm Sistemleri</li>
              <li class="hover:text-white transition-colors">İnternet Altyapı Sistemleri</li>
              <li class="hover:text-white transition-colors">Teknik Servis & Onarım</li>
              <li class="hover:text-white transition-colors">Bilgisayar & Yazıcı Hizmetleri</li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white font-semibold mb-4">İletişim</h4>
            <ul class="space-y-3 text-sm">
              @if (setting?.phone) {
                <li class="flex items-start gap-2">
                  <span class="mt-0.5">📞</span>
                  <a [href]="'tel:' + setting!.phone" class="hover:text-white transition-colors">{{ setting!.phone }}</a>
                </li>
              }
              @if (setting?.email) {
                <li class="flex items-start gap-2">
                  <span class="mt-0.5">✉️</span>
                  <a [href]="'mailto:' + setting!.email" class="hover:text-white transition-colors break-all">{{ setting!.email }}</a>
                </li>
              }
              @if (setting?.address) {
                <li class="flex items-start gap-2">
                  <span class="mt-0.5">📍</span>
                  <span>{{ setting!.address }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 py-5 text-center text-xs text-gray-600">
          © {{ year }} Asel Teknoloji. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent implements OnInit {
  private api      = inject(ApiService);
  private document = inject(DOCUMENT);
  setting: Setting | null = null;
  menuOpen = false;
  year = new Date().getFullYear();

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
  }
}
