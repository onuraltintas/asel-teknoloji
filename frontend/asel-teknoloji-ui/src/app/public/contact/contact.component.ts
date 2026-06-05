import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title, Meta, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Setting } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Hero -->
    <div class="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-20">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div class="text-6xl mb-5">✉️</div>
        <h1 class="text-3xl md:text-4xl font-extrabold mb-4">İletişim</h1>
        <p class="text-blue-200 text-lg">Sorularınız, teklif talepleriniz veya teknik destek için bize ulaşın.</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">

        <!-- ─── İletişim Bilgileri ─── -->
        <div class="lg:col-span-1 space-y-5">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Bize Ulaşın</h2>

          @if (setting?.phone) {
            <div class="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📞</div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Telefon</p>
                <a [href]="'tel:' + setting!.phone" class="text-blue-700 font-bold text-lg hover:text-blue-900 transition-colors">
                  {{ setting!.phone }}
                </a>
              </div>
            </div>
          }

          @if (setting?.email) {
            <div class="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl shrink-0">✉️</div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">E-posta</p>
                <a [href]="'mailto:' + setting!.email" class="text-gray-800 font-semibold hover:text-blue-700 transition-colors break-all">
                  {{ setting!.email }}
                </a>
              </div>
            </div>
          }

          @if (setting?.address) {
            <div class="flex items-start gap-4 bg-gray-50 rounded-2xl p-5">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">📍</div>
              <div>
                <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Adres</p>
                <p class="text-gray-800 font-medium leading-relaxed">{{ setting!.address }}</p>
              </div>
            </div>
          }

          <!-- Social -->
          @if (setting?.facebook || setting?.instagram || setting?.linkedin) {
            <div class="bg-gray-50 rounded-2xl p-5">
              <p class="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">Sosyal Medya</p>
              <div class="flex gap-3">
                @if (setting?.facebook) {
                  <a [href]="setting!.facebook" target="_blank" rel="noopener"
                     class="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors text-sm font-bold">f</a>
                }
                @if (setting?.instagram) {
                  <a [href]="setting!.instagram" target="_blank" rel="noopener"
                     class="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-400 hover:opacity-80 rounded-full flex items-center justify-center text-white transition-opacity text-xs font-bold">ig</a>
                }
                @if (setting?.linkedin) {
                  <a [href]="setting!.linkedin" target="_blank" rel="noopener"
                     class="w-10 h-10 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center text-white transition-colors text-xs font-bold">in</a>
                }
              </div>
            </div>
          }
        </div>

        <!-- ─── İletişim Formu ─── -->
        <div class="lg:col-span-2">
          @if (sent) {
            <div class="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
              <div class="text-6xl mb-5">✅</div>
              <h3 class="text-2xl font-bold text-green-800 mb-3">Mesajınız İletildi!</h3>
              <p class="text-green-700 mb-8">En kısa sürede sizinle iletişime geçeceğiz.</p>
              <button (click)="sent=false; form.reset()"
                      class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Yeni Mesaj Gönder
              </button>
            </div>
          } @else {
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-7">Mesaj Gönderin</h2>
              <form [formGroup]="form" (ngSubmit)="submit()">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <div>
                    <label class="label">Ad Soyad *</label>
                    <input formControlName="fullName" class="input" placeholder="Adınız Soyadınız" />
                    @if (f['fullName'].invalid && f['fullName'].touched) {
                      <p class="text-red-500 text-xs mt-1">Ad Soyad zorunludur.</p>
                    }
                  </div>

                  <div>
                    <label class="label">E-posta *</label>
                    <input formControlName="email" type="email" class="input" placeholder="ornek@mail.com" />
                    @if (f['email'].invalid && f['email'].touched) {
                      <p class="text-red-500 text-xs mt-1">Geçerli bir e-posta adresi girin.</p>
                    }
                  </div>

                  <div>
                    <label class="label">Telefon</label>
                    <input formControlName="phone" class="input" placeholder="0 (5XX) XXX XX XX" />
                  </div>

                  <div>
                    <label class="label">Konu *</label>
                    <input formControlName="subject" class="input" placeholder="Mesaj konusu" />
                    @if (f['subject'].invalid && f['subject'].touched) {
                      <p class="text-red-500 text-xs mt-1">Konu zorunludur.</p>
                    }
                  </div>

                  <div class="sm:col-span-2">
                    <label class="label">Mesajınız *</label>
                    <textarea formControlName="body" class="input" rows="6"
                              placeholder="Mesajınızı buraya yazın..."></textarea>
                    @if (f['body'].invalid && f['body'].touched) {
                      <p class="text-red-500 text-xs mt-1">Mesaj zorunludur.</p>
                    }
                  </div>
                </div>

                @if (errorMsg) {
                  <div class="mt-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
                    {{ errorMsg }}
                  </div>
                }

                <div class="mt-6">
                  <button type="submit" [disabled]="sending"
                          class="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold px-10 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    @if (sending) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Gönderiliyor...
                    } @else {
                      Mesaj Gönder ✈️
                    }
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      </div>

      <!-- ─── Harita ─── -->
      @if (mapUrl) {
        <div class="mt-14 rounded-2xl overflow-hidden shadow-md border border-gray-200" style="height:420px">
          <iframe [src]="mapUrl" width="100%" height="100%" style="border:0" allowfullscreen loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      }
    </div>
  `
})
export class ContactComponent implements OnInit {
  private api       = inject(ApiService);
  private fb        = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private titleSvc  = inject(Title);
  private metaSvc   = inject(Meta);
  private jsonLd    = inject(JsonLdService);
  private cdr       = inject(ChangeDetectorRef);

  setting:  Setting | null = null;
  mapUrl:   SafeResourceUrl | null = null;
  sent    = false;
  sending = false;
  errorMsg = '';

  form = this.fb.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    phone:    [''],
    subject:  ['', Validators.required],
    body:     ['', Validators.required]
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    this.titleSvc.setTitle('İletişim | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description',      content: 'Asel Teknoloji iletişim sayfası. Güvenlik kamera, yangın alarm, teknik servis ve bilişim hizmetleri için teklif alın veya mesaj gönderin.' });
    this.metaSvc.updateTag({ property: 'og:title',     content: 'İletişim | Asel Teknoloji' });
    this.metaSvc.updateTag({ property: 'og:type',      content: 'website' });

    this.api.getSetting().subscribe({
      next: s => {
        this.setting = s;
        if (s.mapsEmbedCode) {
          const src = this.extractMapSrc(s.mapsEmbedCode);
          if (src) this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(src);
        }
        this.cdr.markForCheck();
        this.jsonLd.set({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Asel Teknoloji',
          'url': environment.siteUrl,
          ...(s.phone   && { 'telephone': s.phone }),
          ...(s.email   && { 'email':     s.email }),
          ...(s.address && { 'address': { '@type': 'PostalAddress', 'streetAddress': s.address, 'addressCountry': 'TR' } }),
          ...(s.logoUrl && { 'logo': s.logoUrl }),
          'sameAs': [s.facebook, s.instagram, s.linkedin].filter(Boolean)
        });
      },
      error: () => {}
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending  = true;
    this.errorMsg = '';
    this.api.sendMessage(this.form.value).subscribe({
      next:  () => { this.sent = true; this.sending = false; this.cdr.markForCheck(); },
      error: () => { this.errorMsg = 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'; this.sending = false; this.cdr.markForCheck(); }
    });
  }

  private extractMapSrc(embed: string): string | null {
    const match = embed.match(/src="([^"]+)"/);
    return match ? match[1] : embed.startsWith('http') ? embed : null;
  }
}
