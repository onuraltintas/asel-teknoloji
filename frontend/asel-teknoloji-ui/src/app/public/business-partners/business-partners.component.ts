import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { SeoService } from '../../core/services/seo.service';
import { BusinessPartner } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-business-partners',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './business-partners.component.html'
})
export class BusinessPartnersComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);
  private seo      = inject(SeoService);
  private cdr      = inject(ChangeDetectorRef);

  partners: BusinessPartner[] = [];
  loading = true;
  expanded = new Set<number>();

  toggle(id: number) {
    this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id);
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  ngOnInit() {
    this.titleSvc.setTitle('İş Ortaklarımız | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description', content: 'Asel Teknoloji iş ortakları: güvenlik sistemleri, ağ altyapısı ve teknik servis alanlarında birlikte çalıştığımız tedarikçi ve distribütörler.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'İş Ortaklarımız | Asel Teknoloji' });
    this.seo.setCanonical(`${environment.siteUrl}/is-ortaklarimiz`);

    this.jsonLd.set({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'İş Ortaklarımız | Asel Teknoloji',
      'url': `${environment.siteUrl}/is-ortaklarimiz`,
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': environment.siteUrl }
    });

    this.api.getBusinessPartners().subscribe({
      next: data => { this.partners = data; this.loading = false; this.cdr.markForCheck(); },
      error: ()   => { this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
