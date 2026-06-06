import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Slider, Service, BlogPost, Reference, Setting, Feature, PageContent } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
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
  features: Feature[] = [];
  setting: Setting | null = null;
  vision:  PageContent | null = null;
  mission: PageContent | null = null;
  activeCorpTab: 'vision' | 'mission' = 'vision';
  loading = true;
  get companyName() { return this.setting?.title?.split(' | ')[0] ?? 'Asel Teknoloji'; }
  currentSlide = 0;
  private timer: any;

  ngOnInit() {
    forkJoin({
      sliders:    this.api.getSliders(),
      services:   this.api.getServices(),
      blogs:      this.api.getBlogPosts(),
      setting:    this.api.getSetting(),
      references: this.api.getReferences(),
      features:   this.api.getFeatures(),
      vision:     this.api.getPageContent('vision').pipe(catchError(() => of(null))),
      mission:    this.api.getPageContent('mission').pipe(catchError(() => of(null)))
    }).subscribe({
      next: data => {
        this.sliders     = data.sliders;
        this.services    = data.services;
        this.recentBlogs = data.blogs.slice(0, 3);
        this.references  = data.references;
        this.features    = data.features;
        this.setting     = data.setting;
        this.vision      = data.vision;
        this.mission     = data.mission;
        this.activeCorpTab = data.vision ? 'vision' : 'mission';
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
