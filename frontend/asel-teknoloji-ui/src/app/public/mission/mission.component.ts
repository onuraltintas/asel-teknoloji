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
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mission.component.html'
})
export class MissionComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private seo      = inject(SeoService);
  private cdr      = inject(ChangeDetectorRef);

  page: PageContent | null = null;
  loading = true;

  ngOnInit() {
    this.titleSvc.setTitle('Misyonumuz | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji misyonu: güvenlik kamera, yangın alarm ve bilişim çözümlerinde kaliteli hizmet sunarak müşteri memnuniyetini en üst düzeyde tutmak.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Misyonumuz | Asel Teknoloji' });
    this.seo.setCanonical(`${environment.siteUrl}/misyon`);

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
