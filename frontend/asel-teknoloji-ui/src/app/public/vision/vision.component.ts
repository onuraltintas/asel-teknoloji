import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { SeoService } from '../../core/services/seo.service';
import { PageContent } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vision',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vision.component.html'
})
export class VisionComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private seo      = inject(SeoService);
  private cdr      = inject(ChangeDetectorRef);

  page: PageContent | null = null;
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Vizyonumuz | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji olarak vizyonumuz: teknoloji ile güvenli, bağlantılı ve sürdürülebilir yaşam alanları oluşturmak.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Vizyonumuz | Asel Teknoloji' });
    this.seo.setCanonical(`${environment.siteUrl}/vizyon`);

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Vizyonumuz | Asel Teknoloji',
      'url': `${environment.siteUrl}/vizyon`,
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
    });

    this.api.getPageContent('vision').subscribe({
      next: p  => { this.page = p; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
