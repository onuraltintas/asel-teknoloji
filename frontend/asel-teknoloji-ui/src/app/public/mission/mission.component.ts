import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { PageContent } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero -->
    <div class="bg-blue-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <nav class="flex items-center gap-2 text-blue-300 text-sm mb-6">
          <a routerLink="/" class="hover:text-white transition-colors">Ana Sayfa</a>
          <span>/</span>
          <span class="text-white font-medium">Misyon</span>
        </nav>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">
          {{ page?.title || 'Misyonumuz' }}
        </h1>
        @if (page?.subtitle) {
          <p class="text-blue-200 text-lg max-w-2xl">{{ page!.subtitle }}</p>
        }
      </div>
    </div>

    <!-- İçerik -->
    <section class="py-20 bg-white min-h-96">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">

        @if (loading) {
          <div class="flex justify-center py-20">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (!page) {
          <div class="text-center py-20 text-gray-400">
            <div class="text-5xl mb-4">🎯</div>
            <p class="text-lg">Misyon içeriği henüz eklenmemiş.</p>
          </div>
        } @else {
          <div class="flex flex-col lg:flex-row gap-12 items-start">
            @if (page.imageUrl) {
              <div class="lg:w-2/5 shrink-0">
                <img [src]="page.imageUrl" [alt]="page.title"
                     class="w-full rounded-2xl shadow-lg object-cover"
                     onerror="this.style.display='none'" />
              </div>
            }
            <div [class]="page.imageUrl ? 'lg:w-3/5' : 'w-full'">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-1 h-12 bg-orange-500 rounded-full"></div>
                <h2 class="text-2xl font-extrabold text-gray-900">{{ page.title }}</h2>
              </div>
              <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {{ page.content }}
              </div>
            </div>
          </div>
        }

      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 bg-blue-900 text-white text-center">
      <div class="max-w-2xl mx-auto px-4">
        <h2 class="text-3xl font-extrabold mb-4">Vizyonumuzu da İnceleyin</h2>
        <p class="text-blue-200 mb-8">Geleceğe bakışımız ve uzun vadeli hedeflerimiz hakkında bilgi edinin.</p>
        <a routerLink="/vizyon"
           class="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full transition-colors shadow-lg">
          Vizyonumuzu Görün →
        </a>
      </div>
    </section>
  `
})
export class MissionComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  page: PageContent | null = null;
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Misyonumuz | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji misyon sayfası.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Misyonumuz | Asel Teknoloji' });

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Misyonumuz | Asel Teknoloji',
      'url': `${environment.siteUrl}/misyon`,
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
    });

    this.api.getPageContent('mission').subscribe({
      next: p  => { this.page = p; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
