import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';

interface StatusResult {
  serviceCode: string;
  status: number;
  statusLabel: string;
  deviceType: string;
  adminNote?: string;
  createdAt: string;
}

@Component({
  selector: 'app-service-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Hero -->
    <div class="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div class="text-6xl mb-5">🔍</div>
        <h1 class="text-3xl md:text-4xl font-extrabold mb-4">Servis Durum Sorgulama</h1>
        <p class="text-blue-200 text-lg">Teknik servis kaydınız için aldığınız kodu girerek cihazınızın anlık durumunu öğrenin.</p>
      </div>
    </div>

    <!-- Search -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div class="flex gap-3">
          <input [(ngModel)]="code" (keyup.enter)="search()"
                 placeholder="Servis kodunuzu girin (örn: ASL123456)"
                 maxlength="20"
                 class="flex-1 border-2 border-gray-200 focus:border-blue-600 rounded-xl px-5 py-3 text-lg font-mono outline-none transition-colors uppercase"
                 [attr.disabled]="searching() ? true : null" />
          <button (click)="search()" [attr.disabled]="(searching() || !code.trim()) ? true : null"
                  class="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl transition-colors flex items-center gap-2">
            @if (searching()) {
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            } @else {
              🔍
            }
            Sorgula
          </button>
        </div>
        @if (errorMsg()) {
          <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
            {{ errorMsg() }}
          </div>
        }
      </div>
    </div>

    <!-- Result -->
    @if (result(); as r) {
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-14">

        <!-- Info card -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-10">
          <div class="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Servis Kodu</p>
              <p class="text-2xl font-bold font-mono text-blue-800">{{ r.serviceCode }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Kayıt Tarihi</p>
              <p class="font-semibold text-gray-700">{{ formatDate(r.createdAt) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Cihaz Türü</p>
              <p class="font-semibold text-gray-800">{{ r.deviceType }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-1">Güncel Durum</p>
              <span class="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                    [class]="statusClass(r.status)">
                {{ r.statusLabel }}
              </span>
            </div>
          </div>
          @if (r.adminNote) {
            <div class="mt-6 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
              <p class="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Teknik Not</p>
              <p class="text-gray-700">{{ r.adminNote }}</p>
            </div>
          }
        </div>

        <!-- Stepper -->
        <h2 class="text-lg font-bold text-gray-800 mb-6">Servis Aşamaları</h2>
        <div class="relative">
          <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
          <div class="space-y-4 relative z-10">
            @for (step of steps; track step.status) {
              <div class="flex items-start gap-5">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all"
                     [class]="stepClass(step.status, r.status)">
                  @if (isCompleted(step.status, r.status)) { ✓ }
                  @else if (isActive(step.status, r.status)) { {{ step.status + 1 }} }
                  @else { {{ step.status + 1 }} }
                </div>
                <div class="pt-1.5 pb-6">
                  <h3 class="font-bold"
                      [class.text-blue-700]="isActive(step.status, r.status)"
                      [class.text-green-700]="isCompleted(step.status, r.status)"
                      [class.text-gray-400]="isPending(step.status, r.status)">
                    {{ step.label }}
                  </h3>
                  <p class="text-sm mt-0.5"
                     [class.text-gray-500]="!isPending(step.status, r.status)"
                     [class.text-gray-300]="isPending(step.status, r.status)">
                    {{ step.desc }}
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- New search -->
        <div class="mt-10 text-center">
          <button (click)="reset()"
                  class="text-blue-600 hover:text-blue-800 font-semibold underline">
            Farklı Bir Kod Sorgula
          </button>
        </div>
      </div>
    }

    <!-- Not found state -->
    @if (!result() && errorMsg()) {
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div class="text-6xl mb-5">🔎</div>
        <h2 class="text-xl font-bold text-gray-800 mb-3">Servis Kaydı Bulunamadı</h2>
        <p class="text-gray-500 mb-2">
          <span class="font-mono font-bold text-blue-800">{{ code }}</span> koduna ait bir servis kaydı sistemde mevcut değil.
        </p>
        <p class="text-gray-400 text-sm mb-8">Kodu doğru girdiğinizden emin olun. Henüz kaydınız yoksa aşağıdan bizimle iletişime geçebilirsiniz.</p>
        <div class="flex gap-4 justify-center flex-wrap">
          <button (click)="reset()" class="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
            Tekrar Sorgula
          </button>
          <a routerLink="/iletisim" class="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2.5 rounded-xl transition-colors">
            Servis Kaydı Oluştur
          </a>
        </div>
      </div>
    }

    <!-- Empty state (before search) -->
    @if (!result() && !errorMsg() && !searching()) {
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p class="text-gray-400 mb-2">Henüz bir sorgulama yapılmadı.</p>
        <p class="text-gray-400 text-sm">Servis kaydı oluşturmak için <a routerLink="/iletisim" class="text-blue-600 underline">İletişim</a> sayfasını ziyaret edin.</p>
      </div>
    }
  `
})
export class ServiceStatusComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);

  code      = '';
  result    = signal<StatusResult | null>(null);
  searching = signal(false);
  errorMsg  = signal('');

  ngOnInit() {
    this.titleSvc.setTitle('Servis Durum Sorgulama | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description',      content: 'Cihazınızın teknik servis durumunu takip kodunuzla anlık olarak sorgulayın. Asel Teknoloji servis takip sistemi.' });
    this.metaSvc.updateTag({ property: 'og:title',     content: 'Servis Durum Sorgulama | Asel Teknoloji' });
    this.metaSvc.updateTag({ property: 'og:type',      content: 'website' });

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Servis Durum Sorgulama | Asel Teknoloji',
      'description': 'Cihazınızın teknik servis durumunu takip kodunuzla anlık olarak sorgulayın. Asel Teknoloji servis takip sistemi.',
      'url': 'https://aselteknoloji.com/servis-takip',
      'publisher': {
        '@type': 'Organization',
        'name': 'Asel Teknoloji',
        'url': 'https://aselteknoloji.com'
      }
    });
  }

  steps = [
    { status: 0, label: 'Kayıt Alındı',       desc: 'Arıza kaydınız sisteme alındı.' },
    { status: 1, label: 'İnceleme Aşamasında', desc: 'Teknisyenlerimiz cihazınızı inceliyor.' },
    { status: 2, label: 'Parça Bekleniyor',    desc: 'Gerekli parçalar temin ediliyor.' },
    { status: 3, label: 'Tamamlandı',          desc: 'Cihazınız hazır, teslim alabilirsiniz.' },
    { status: 4, label: 'İptal Edildi',        desc: 'Servis kaydı iptal edildi.' },
  ];

  search() {
    const trimmed = this.code.trim().toUpperCase();
    if (!trimmed) return;
    this.searching.set(true);
    this.errorMsg.set('');
    this.result.set(null);
    this.api.queryServiceStatus(trimmed).subscribe({
      next:  r  => { this.result.set(r);   this.searching.set(false); },
      error: () => { this.errorMsg.set(`"${trimmed}" koduna ait servis kaydı bulunamadı. Lütfen kodu kontrol edin.`); this.searching.set(false); }
    });
  }

  reset() { this.result.set(null); this.errorMsg.set(''); this.code = ''; }

  isActive(s: number, status: number)    { return status === s && s !== 4; }
  isCompleted(s: number, status: number) { return status !== 4 && s < status && s !== 4; }
  isPending(s: number, status: number)   { return !this.isActive(s, status) && !this.isCompleted(s, status); }

  stepClass(s: number, status: number) {
    if (status === 4 && s === 4) return 'bg-red-100 text-red-600 border-2 border-red-400';
    if (this.isCompleted(s, status)) return 'bg-green-500 text-white';
    if (this.isActive(s, status))    return 'bg-blue-600 text-white ring-4 ring-blue-100';
    return 'bg-gray-100 text-gray-400 border border-gray-200';
  }

  statusClass(s: number) {
    const m: Record<number,string> = {
      0: 'bg-yellow-100 text-yellow-700',
      1: 'bg-blue-100 text-blue-700',
      2: 'bg-orange-100 text-orange-700',
      3: 'bg-green-100 text-green-700',
      4: 'bg-red-100 text-red-600'
    };
    return m[s] ?? 'bg-gray-100 text-gray-600';
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
