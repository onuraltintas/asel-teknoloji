import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Slider, Service, BlogPost, Reference } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ═══════════════════════════════════ HERO SLIDER ═══════════════════════════════════ -->
    <section class="relative bg-blue-950 overflow-hidden" style="height:580px">

      @if (sliders.length === 0 && !loading) {
        <!-- Fallback hero -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center">
          <div class="text-center text-white px-6 max-w-3xl">
            <h1 class="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
              Teknoloji <span class="text-orange-400">Güvenilir</span> Ellerde
            </h1>
            <p class="text-blue-200 text-lg md:text-xl mb-8">Güvenlik kamera, yangın alarm, teknik servis ve bilişim çözümlerinde güvenilir adresiniz.</p>
            <div class="flex gap-4 justify-center flex-wrap">
              <a routerLink="/iletisim" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg">
                Teklif Al
              </a>
              <a routerLink="/servis-takip" class="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-full font-semibold transition-all">
                Servis
              </a>
            </div>
          </div>
        </div>
      }

      @for (slide of sliders; track slide.id; let i = $index) {
        <div class="absolute inset-0 transition-opacity duration-700"
             [class.opacity-100]="i === currentSlide"
             [class.opacity-0]="i !== currentSlide">
          <img [src]="slide.imageUrl" [alt]="slide.title"
               class="w-full h-full object-cover"
               onerror="this.style.display='none'" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          <div class="absolute inset-0 flex items-center">
            <div class="max-w-7xl mx-auto px-6 sm:px-10 w-full">
              <div class="max-w-2xl">
                <h2 class="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  {{ slide.title }}
                </h2>
                @if (slide.subTitle) {
                  <p class="text-blue-100 text-lg md:text-xl mb-8 drop-shadow">{{ slide.subTitle }}</p>
                }
                <div class="flex gap-4 flex-wrap">
                  <a [routerLink]="slide.targetUrl || '/iletisim'"
                     class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg inline-block">
                    Bilgi Al
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (sliders.length > 1) {
        <!-- Prev / Next -->
        <button (click)="prevSlide()"
                class="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition flex items-center justify-center text-xl">‹</button>
        <button (click)="nextSlide()"
                class="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition flex items-center justify-center text-xl">›</button>

        <!-- Dots -->
        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          @for (slide of sliders; track slide.id; let i = $index) {
            <button (click)="goTo(i)"
                    class="h-2 rounded-full transition-all duration-300"
                    [class.bg-orange-400]="i === currentSlide"
                    [class.w-6]="i === currentSlide"
                    [class.bg-white/50]="i !== currentSlide"
                    [class.w-2]="i !== currentSlide">
            </button>
          }
        </div>
      }
    </section>

    <!-- ═══════════════════════════════════ HİZMETLER ═══════════════════════════════════ -->
    <section id="hizmetler" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-14">
          <span class="text-orange-500 font-semibold text-sm uppercase tracking-widest">Ne Yapıyoruz?</span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Hizmetlerimiz</h2>
          <div class="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
        </div>

        @if (services.length === 0 && !loading) {
          <p class="text-center text-gray-400">Yakında hizmetlerimiz burada yayınlanacak.</p>
        }

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (service of services; track service.id) {
            <a [routerLink]="['/hizmet', service.slug]"
               class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              @if (service.imageUrl) {
                <div class="overflow-hidden h-48">
                  <img [src]="service.imageUrl" [alt]="service.title"
                       class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       onerror="this.parentElement.style.display='none'" />
                </div>
              } @else {
                <div class="h-48 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <div class="text-5xl">🔧</div>
                </div>
              }
              <div class="p-6">
                @if (service.categoryName) {
                  <span class="text-xs font-semibold text-orange-500 uppercase tracking-wider">{{ service.categoryName }}</span>
                }
                <h3 class="text-lg font-bold text-gray-900 mt-1 mb-2 group-hover:text-blue-700 transition-colors">{{ service.title }}</h3>
                <p class="text-gray-500 text-sm line-clamp-3">{{ service.shortDescription }}</p>
                <div class="mt-4 flex items-center text-blue-700 text-sm font-semibold gap-1">
                  Detaylı Bilgi <span class="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ NEDEN BİZ ═══════════════════════════════════ -->
    <section class="py-20 bg-blue-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-14">
          <span class="text-orange-400 font-semibold text-sm uppercase tracking-widest">Fark Yaratan Özelliklerimiz</span>
          <h2 class="text-3xl md:text-4xl font-extrabold mt-2">Neden Asel Teknoloji?</h2>
          <div class="w-16 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (feature of features; track feature.icon) {
            <div class="bg-white/10 hover:bg-white/15 transition-colors rounded-2xl p-7 text-center">
              <div class="text-5xl mb-4">{{ feature.icon }}</div>
              <h3 class="font-bold text-lg mb-2">{{ feature.title }}</h3>
              <p class="text-blue-200 text-sm leading-relaxed">{{ feature.desc }}</p>
            </div>
          }
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 border-t border-white/20 pt-12">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <div class="text-4xl font-extrabold text-orange-400">{{ stat.value }}</div>
              <div class="text-blue-200 text-sm mt-1">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════ BLOG ═══════════════════════════════════ -->
    @if (recentBlogs.length > 0) {
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="flex items-end justify-between mb-12">
            <div>
              <span class="text-orange-500 font-semibold text-sm uppercase tracking-widest">Haberler & İpuçları</span>
              <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Son Blog Yazıları</h2>
            </div>
            <a routerLink="/blog" class="hidden md:flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition-colors">
              Tüm Yazılar <span>→</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (post of recentBlogs; track post.id) {
              <a [routerLink]="['/blog', post.slug]"
                 class="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                @if (post.imageUrl) {
                  <div class="overflow-hidden h-48">
                    <img [src]="post.imageUrl" [alt]="post.title"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         onerror="this.parentElement.style.display='none'" />
                  </div>
                } @else {
                  <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span class="text-4xl">📝</span>
                  </div>
                }
                <div class="p-6">
                  <p class="text-xs text-gray-400 mb-2">{{ formatDate(post.createdAt) }}</p>
                  <h3 class="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors line-clamp-2">{{ post.title }}</h3>
                  <div class="mt-3 text-blue-700 text-sm font-semibold flex items-center gap-1">
                    Devamını Oku <span class="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </a>
            }
          </div>

          <div class="md:hidden mt-8 text-center">
            <a routerLink="/blog" class="text-blue-700 font-semibold">Tüm Yazılar →</a>
          </div>
        </div>
      </section>
    }

    <!-- ═══════════════════════════════════ REFERANSLAR ═══════════════════════════════════ -->
    @if (references.length > 0) {
      <section class="py-16 bg-gray-50 border-t border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="text-center mb-10">
            <span class="text-orange-500 font-semibold text-sm uppercase tracking-widest">Güvenilir Çözüm Ortağınız</span>
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">Referanslarımız</h2>
            <div class="w-16 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
            @for (ref of references; track ref.id) {
              <div class="bg-white rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow group">
                @if (ref.imageUrl) {
                  <img [src]="ref.imageUrl" [alt]="ref.name"
                       class="h-12 w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                       onerror="this.style.display='none'" />
                } @else {
                  <div class="h-12 flex items-center justify-center text-3xl">🏢</div>
                }
                <p class="text-xs text-gray-500 mt-2 font-medium leading-tight">{{ ref.name }}</p>
              </div>
            }
          </div>
          <div class="text-center mt-8">
            <a routerLink="/referanslar" class="text-blue-700 font-semibold hover:text-blue-900 transition-colors">
              Tüm Referanslar →
            </a>
          </div>
        </div>
      </section>
    }

    <!-- ═══════════════════════════════════ CTA ═══════════════════════════════════ -->
    <section class="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Cihazınızın Servis Durumunu Öğrenin</h2>
        <p class="text-orange-100 text-lg mb-8 max-w-xl mx-auto">Size verilen takip kodu ile cihazınızın anlık servis aşamasını sorgulayabilirsiniz.</p>
        <a routerLink="/servis-takip"
           class="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 py-4 rounded-full transition-colors shadow-lg text-lg">
          🔍 Servis Sorgula
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private api        = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private titleSvc   = inject(Title);
  private metaSvc    = inject(Meta);
  private jsonLd     = inject(JsonLdService);
  private cdr        = inject(ChangeDetectorRef);

  sliders: Slider[] = [];
  services: Service[] = [];
  recentBlogs: BlogPost[] = [];
  references: Reference[] = [];
  loading = true;
  currentSlide = 0;
  private timer: any;

  features = [
    { icon: '🛡️', title: 'Güvenilir Hizmet',   desc: 'Yıllarca süren tecrübemiz ve müşteri memnuniyeti odaklı yaklaşımımızla yanınızdayız.' },
    { icon: '⚡', title: 'Hızlı Çözüm',        desc: 'Arıza ve teknik servis taleplerinize en kısa sürede müdahale ediyoruz.' },
    { icon: '🔧', title: 'Uzman Ekip',          desc: 'Alanında uzman teknisyen kadromuz en karmaşık sorunları çözmeye hazır.' },
    { icon: '📞', title: '7/24 Destek',         desc: 'Acil durumlarda 7 gün 24 saat ulaşabileceğiniz destek hattımız hizmetinizde.' },
  ];

  stats = [
    { value: '500+', label: 'Tamamlanan Proje' },
    { value: '10+',  label: 'Yıllık Deneyim' },
    { value: '98%',  label: 'Müşteri Memnuniyeti' },
    { value: '24/7', label: 'Teknik Destek' },
  ];

  ngOnInit() {
    forkJoin({
      sliders:    this.api.getSliders(),
      services:   this.api.getServices(),
      blogs:      this.api.getBlogPosts(),
      setting:    this.api.getSetting(),
      references: this.api.getReferences()
    }).subscribe({
      next: data => {
        this.sliders     = data.sliders;
        this.services    = data.services;
        this.recentBlogs = data.blogs.slice(0, 3);
        this.references  = data.references;
        this.loading     = false;
        if (this.sliders.length > 1 && isPlatformBrowser(this.platformId)) this.startTimer();
        this.cdr.markForCheck();

        const s = data.setting;
        const title = s?.title || 'Asel Teknoloji';
        const desc  = s?.description || 'Güvenlik kamera, yangın alarm, internet altyapı sistemleri, teknik servis ve bilişim çözümleri.';
        this.titleSvc.setTitle(title);
        this.metaSvc.updateTag({ name: 'description',          content: desc });
        this.metaSvc.updateTag({ name: 'keywords',             content: s?.keywords || 'güvenlik kamera, yangın alarm, teknik servis, bilgisayar tamiri, asel teknoloji' });
        this.metaSvc.updateTag({ property: 'og:title',         content: title });
        this.metaSvc.updateTag({ property: 'og:description',   content: desc });
        this.metaSvc.updateTag({ property: 'og:type',          content: 'website' });

        this.jsonLd.set({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Asel Teknoloji',
          'description': desc,
          'url': environment.siteUrl,
          ...(s?.phone    && { 'telephone': s.phone }),
          ...(s?.email    && { 'email':     s.email }),
          ...(s?.address  && { 'address': { '@type': 'PostalAddress', 'streetAddress': s.address, 'addressCountry': 'TR' } }),
          ...(s?.logoUrl  && { 'logo': s.logoUrl }),
          'sameAs': [s?.facebook, s?.instagram, s?.linkedin].filter(Boolean)
        });
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  ngOnDestroy() { clearInterval(this.timer); }

  prevSlide() { this.goTo((this.currentSlide - 1 + this.sliders.length) % this.sliders.length); }
  nextSlide() { this.goTo((this.currentSlide + 1) % this.sliders.length); }
  goTo(i: number) { this.currentSlide = i; this.resetTimer(); }

  private startTimer() {
    this.timer = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.sliders.length;
    }, 5000);
  }

  private resetTimer() {
    clearInterval(this.timer);
    this.startTimer();
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
