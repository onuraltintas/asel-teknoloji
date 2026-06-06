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
  templateUrl: './references.component.html'
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
