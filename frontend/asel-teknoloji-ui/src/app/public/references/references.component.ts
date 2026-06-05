import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Reference } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero -->
    <div class="bg-blue-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <nav class="flex items-center gap-2 text-blue-300 text-sm mb-6">
          <a routerLink="/" class="hover:text-white transition-colors">Ana Sayfa</a>
          <span>/</span>
          <span class="text-white font-medium">Referanslar</span>
        </nav>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Referanslarımız</h1>
        <p class="text-blue-200 text-lg max-w-2xl">
          Güvenlik sistemleri, ağ altyapısı ve teknik servis alanlarında hizmet verdiğimiz
          müşteri ve kurumlardan bir bölümü.
        </p>
      </div>
    </div>

    <!-- İçerik -->
    <section class="py-20 bg-gray-50 min-h-96">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">

        @if (loading) {
          <div class="flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (references.length === 0) {
          <div class="text-center py-20 text-gray-400">
            <div class="text-5xl mb-4">🏢</div>
            <p class="text-lg">Referanslar yakında eklenecek.</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            @for (ref of references; track ref.id) {
              <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col items-center text-center group">
                @if (ref.imageUrl) {
                  <div class="h-16 flex items-center justify-center mb-3 w-full">
                    <img [src]="ref.imageUrl" [alt]="ref.name"
                         class="max-h-14 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                         onerror="this.parentElement.innerHTML='<div class=\'text-3xl\'>🏢</div>'" />
                  </div>
                } @else {
                  <div class="h-16 flex items-center justify-center mb-3">
                    <div class="text-4xl">🏢</div>
                  </div>
                }
                <h3 class="font-semibold text-gray-800 text-sm leading-tight">{{ ref.name }}</h3>
                @if (ref.description) {
                  <p class="text-gray-400 text-xs mt-1 line-clamp-2">{{ ref.description }}</p>
                }
                @if (ref.website) {
                  <a [href]="ref.website" target="_blank" rel="noopener noreferrer"
                     class="mt-2 text-blue-600 text-xs hover:underline">Web Sitesi →</a>
                }
              </div>
            }
          </div>
        }

      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-blue-900 text-white text-center">
      <div class="max-w-2xl mx-auto px-4">
        <h2 class="text-3xl font-extrabold mb-4">Siz de Referanslarımız Arasında Yer Alın</h2>
        <p class="text-blue-200 mb-8">Güvenlik, bilişim veya ofis ekipmanları konusunda profesyonel destek için bugün iletişime geçin.</p>
        <a routerLink="/iletisim"
           class="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full transition-colors shadow-lg">
          Teklif Alın
        </a>
      </div>
    </section>
  `
})
export class ReferencesComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  references: Reference[] = [];
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Referanslarımız | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji referansları: güvenlik kamera, yangın alarm, ağ altyapısı ve teknik servis hizmetleri verdiğimiz firmalar ve kurumlar.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Referanslarımız | Asel Teknoloji' });

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Referanslarımız | Asel Teknoloji',
      'url': `${environment.siteUrl}/referanslar`,
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
    });

    this.api.getReferences().subscribe({
      next: refs => { this.references = refs; this.loading = false; this.cdr.markForCheck(); },
      error: ()  => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
