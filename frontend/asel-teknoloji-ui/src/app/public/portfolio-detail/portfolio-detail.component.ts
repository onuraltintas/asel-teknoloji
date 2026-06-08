import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Portfolio } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portfolio-detail.component.html'
})
export class PortfolioDetailComponent implements OnInit {
  private api      = inject(ApiService);
  private route    = inject(ActivatedRoute);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  portfolio: Portfolio | null = null;
  loading = true;
  notFound = false;
  activeIndex = signal(0);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.api.getPortfolioBySlug(slug).subscribe({
      next: item => {
        this.portfolio = item;
        this.loading = false;
        this.titleSvc.setTitle(`${item.title} | Projelerimiz | Asel Teknoloji`);
        this.metaSvc.updateTag({ name: 'description', content: item.description ?? `${item.title} — Asel Teknoloji tarafından gerçekleştirilen proje.` });
        this.metaSvc.updateTag({ property: 'og:title', content: `${item.title} | Asel Teknoloji` });
        const cover = this.getImages()[0];
        if (cover) this.metaSvc.updateTag({ property: 'og:image', content: cover });
        this.jsonLd.set({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          'name': item.title,
          'url': `${environment.siteUrl}/projeler/${item.slug}`,
          'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
        });
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.notFound = true; this.cdr.markForCheck(); }
    });
  }

  getImages(): string[] {
    if (!this.portfolio?.images) return [];
    try { return JSON.parse(this.portfolio.images); } catch { return this.portfolio.images ? [this.portfolio.images] : []; }
  }

  getTags(): string[] {
    return this.portfolio?.tags ? this.portfolio.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  setActive(i: number) { this.activeIndex.set(i); }
}
