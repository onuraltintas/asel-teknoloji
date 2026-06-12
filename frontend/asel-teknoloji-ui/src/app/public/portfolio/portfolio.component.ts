import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { SeoService } from '../../core/services/seo.service';
import { Portfolio } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio.component.html'
})
export class PortfolioComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private seo      = inject(SeoService);
  private cdr      = inject(ChangeDetectorRef);

  portfolios: Portfolio[] = [];
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Projelerimiz | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji tarafından gerçekleştirilen projeler: güvenlik kamera, yangın alarm, ağ altyapısı ve teknik servis çalışmaları.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Projelerimiz | Asel Teknoloji' });
    this.seo.setCanonical(`${environment.siteUrl}/projeler`);

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Projelerimiz | Asel Teknoloji',
      'url': `${environment.siteUrl}/projeler`,
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
    });

    this.api.getPortfolios().subscribe({
      next: items => { this.portfolios = items; this.loading = false; this.cdr.markForCheck(); },
      error: ()   => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  getTags(tags?: string): string[] {
    return tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  getCoverImage(images?: string): string | null {
    if (!images) return null;
    try { const arr = JSON.parse(images); return arr[0] ?? null; } catch { return images || null; }
  }
}
