import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title, Meta, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';
import { Setting } from '../../core/models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  private api       = inject(ApiService);
  private fb        = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private titleSvc  = inject(Title);
  private metaSvc   = inject(Meta);
  private jsonLd    = inject(JsonLdService);
  private cdr       = inject(ChangeDetectorRef);

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
    this.metaSvc.updateTag({ name: 'description',      content: 'Asel Teknoloji iletişim sayfası. Güvenlik kamera, yangın alarm, teknik servis ve bilişim hizmetleri için teklif alın veya mesaj gönderin.' });
    this.metaSvc.updateTag({ property: 'og:title',     content: 'İletişim | Asel Teknoloji' });
    this.metaSvc.updateTag({ property: 'og:type',      content: 'website' });

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
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending  = true;
    this.errorMsg = '';
    this.api.sendMessage(this.form.value).subscribe({
      next:  () => { this.sent = true; this.sending = false; this.cdr.markForCheck(); },
      error: () => { this.errorMsg = 'Mesaj gönderilemedi. Lütfen tekrar deneyin.'; this.sending = false; this.cdr.markForCheck(); }
    });
  }

  private extractMapSrc(embed: string): string | null {
    const match = embed.match(/src="([^"]+)"/);
    return match ? match[1] : embed.startsWith('http') ? embed : null;
  }
}
