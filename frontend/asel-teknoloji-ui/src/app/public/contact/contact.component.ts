import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title, Meta, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { SeoService } from '../../core/services/seo.service';
import { Setting } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit, OnDestroy {
  private api        = inject(ApiService);
  private fb         = inject(FormBuilder);
  private sanitizer  = inject(DomSanitizer);
  private titleSvc   = inject(Title);
  private metaSvc    = inject(Meta);
  private jsonLd     = inject(JsonLdService);
  private seo        = inject(SeoService);
  private cdr        = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  setting:  Setting | null = null;
  mapUrl:   SafeResourceUrl | null = null;
  sent    = false;
  sending = false;
  errorMsg = '';

  form = this.fb.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    phone:    [''],
    subject:  ['', Validators.required],
    body:     ['', Validators.required]
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    this.titleSvc.setTitle('İletişim | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description',      content: 'Asel Teknoloji ile iletişime geçin. Güvenlik kamera, yangın alarm, ağ altyapısı ve teknik servis konularında teklif ve destek için bize ulaşın.' });
    this.metaSvc.updateTag({ property: 'og:title',     content: 'İletişim | Asel Teknoloji' });
    this.metaSvc.updateTag({ property: 'og:type',      content: 'website' });
    this.seo.setCanonical(`${environment.siteUrl}/iletisim`);

    this.api.getSetting().subscribe({
      next: s => {
        this.setting = s;
        if (s.mapsEmbedCode) {
          const src = this.extractMapSrc(s.mapsEmbedCode);
          if (src) this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(src);
        }
        this.cdr.markForCheck();
        this.jsonLd.set({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Asel Teknoloji',
          'url': environment.siteUrl,
          ...(s.phone   && { 'telephone': s.phone }),
          ...(s.email   && { 'email':     s.email }),
          ...(s.address && { 'address': { '@type': 'PostalAddress', 'streetAddress': s.address, 'addressCountry': 'TR' } }),
          ...(s.logoUrl && { 'logo': s.logoUrl }),
          'sameAs': [s.facebook, s.instagram, s.linkedin].filter(Boolean)
        });
      },
      error: () => {}
    });

    if (isPlatformBrowser(this.platformId) && environment.recaptchaSiteKey) {
      this.loadRecaptchaScript();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('recaptcha-script');
      el?.remove();
      document.querySelector('.grecaptcha-badge')?.parentElement?.remove();
    }
  }

  submit() {
    if (this.form.invalid || this.sending) { this.form.markAllAsTouched(); return; }
    this.sending = true; this.errorMsg = '';

    const doSubmit = (token?: string) => {
      const dto = { ...this.form.value, recaptchaToken: token };
      this.api.sendMessage(dto).subscribe({
        next:  () => { this.sent = true; this.sending = false; this.cdr.markForCheck(); },
        error: (err) => {
          this.errorMsg = err?.error?.error ?? 'Mesaj gönderilemedi. Lütfen tekrar deneyin.';
          this.sending = false;
          this.cdr.markForCheck();
        }
      });
    };

    const w = window as any;
    if (isPlatformBrowser(this.platformId) && environment.recaptchaSiteKey && w.grecaptcha) {
      w.grecaptcha.ready(() => {
        w.grecaptcha.execute(environment.recaptchaSiteKey, { action: 'contact' })
          .then((token: string) => doSubmit(token));
      });
    } else {
      doSubmit();
    }
  }

  private loadRecaptchaScript() {
    if (document.getElementById('recaptcha-script')) return;
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
    script.async = true;
    document.head.appendChild(script);
  }

  private extractMapSrc(embed: string): string | null {
    const match = embed.match(/src="([^"]+)"/);
    return match ? match[1] : embed.startsWith('http') ? embed : null;
  }
}
