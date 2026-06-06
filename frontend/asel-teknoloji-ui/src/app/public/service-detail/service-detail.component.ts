import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Service } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html'
})
export class ServiceDetailComponent implements OnInit {
  private api      = inject(ApiService);
  private route    = inject(ActivatedRoute);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private cdr      = inject(ChangeDetectorRef);

  service: Service | null = null;
  loading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.loading = true;
      this.api.getServiceBySlug(slug).subscribe({
        next: s => {
          this.service = s;
          this.loading = false;
          const title = s.metaTitle || `${s.title} | Asel Teknoloji`;
          const desc  = s.metaDescription || s.shortDescription || '';
          this.titleSvc.setTitle(title);
          this.metaSvc.updateTag({ name: 'description',        content: desc });
          this.metaSvc.updateTag({ property: 'og:title',       content: title });
          this.metaSvc.updateTag({ property: 'og:description', content: desc });
          this.metaSvc.updateTag({ property: 'og:type',        content: 'website' });
          if (s.imageUrl) this.metaSvc.updateTag({ property: 'og:image', content: s.imageUrl });

          const pageUrl = `${environment.siteUrl}/hizmet/${s.slug}`;
          this.jsonLd.set({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Service',
                'name': s.title,
                'description': desc,
                'url': pageUrl,
                'provider': { '@type': 'LocalBusiness', 'name': 'Asel Teknoloji', 'url': environment.siteUrl },
                ...(s.imageUrl && { 'image': s.imageUrl })
              },
              {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                  { '@type': 'ListItem', 'position': 1, 'name': 'Ana Sayfa', 'item': environment.siteUrl },
                  { '@type': 'ListItem', 'position': 2, 'name': s.categoryName || 'Hizmetler', 'item': `${environment.siteUrl}/#hizmetler` },
                  { '@type': 'ListItem', 'position': 3, 'name': s.title, 'item': pageUrl }
                ]
              }
            ]
          });
          this.cdr.markForCheck();
        },
        error: () => { this.service = null; this.loading = false; this.cdr.markForCheck(); }
      });
    });
  }
}
