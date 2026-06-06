import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(ToastService);

  uploading = signal<Record<string, boolean>>({});

  fields = [
    { key: 'title',            label: 'Site Başlığı / Firma Adı',  full: true },
    { key: 'tagline',          label: 'Hero Slogan',                full: true },
    { key: 'taglineSubtitle',  label: 'Hero Alt Metin',             full: true },
    { key: 'description',      label: 'Genel Açıklama (SEO & Footer)', full: true, textarea: true },
    { key: 'keywords',         label: 'Anahtar Kelimeler',          full: true },
    { key: 'phone',            label: 'Telefon' },
    { key: 'email',            label: 'E-posta',                    type: 'email' },
    { key: 'address',          label: 'Adres',                      full: true, textarea: true },
    { key: 'facebook',         label: 'Facebook URL' },
    { key: 'instagram',        label: 'Instagram URL' },
    { key: 'linkedin',         label: 'LinkedIn URL' },
    { key: 'whatsapp',         label: 'WhatsApp URL' },
    { key: 'youtube',          label: 'YouTube URL' },
    { key: 'twitter',          label: 'Twitter / X URL' },
    { key: 'stat1Value',       label: 'İstatistik 1 — Değer',       section: 'stats' },
    { key: 'stat1Label',       label: 'İstatistik 1 — Açıklama',    section: 'stats' },
    { key: 'stat2Value',       label: 'İstatistik 2 — Değer',       section: 'stats' },
    { key: 'stat2Label',       label: 'İstatistik 2 — Açıklama',    section: 'stats' },
    { key: 'stat3Value',       label: 'İstatistik 3 — Değer',       section: 'stats' },
    { key: 'stat3Label',       label: 'İstatistik 3 — Açıklama',    section: 'stats' },
    { key: 'stat4Value',       label: 'İstatistik 4 — Değer',       section: 'stats' },
    { key: 'stat4Label',       label: 'İstatistik 4 — Açıklama',    section: 'stats' },
    { key: 'logoUrl',          label: 'Logo (400×200)',              full: true },
    { key: 'faviconUrl',       label: 'Favicon (64×64)',             full: true },
    { key: 'mapsEmbedCode',    label: 'Google Maps Embed Kodu',      full: true, textarea: true },
  ];

  form = this.fb.group({
    title: [''], tagline: [''], taglineSubtitle: [''],
    description: [''], keywords: [''], phone: [''], email: [''],
    address: [''], facebook: [''], instagram: [''], linkedin: [''],
    whatsapp: [''], youtube: [''], twitter: [''],
    stat1Value: [''], stat1Label: [''], stat2Value: [''], stat2Label: [''],
    stat3Value: [''], stat3Label: [''], stat4Value: [''], stat4Label: [''],
    logoUrl: [''], faviconUrl: [''], mapsEmbedCode: ['']
  });

  ngOnInit() { this.api.getSetting().subscribe(s => this.form.patchValue(s)); }

  onFileSelect(event: Event, fieldKey: string) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    const type = fieldKey === 'faviconUrl' ? 'favicon' : 'logo';
    this.uploading.set({ ...this.uploading(), [fieldKey]: true });
    this.api.uploadImage(file, type as any).subscribe({
      next: res => {
        this.form.patchValue({ [fieldKey]: res.url });
        this.uploading.set({ ...this.uploading(), [fieldKey]: false });
        input.value = '';
      },
      error: err => {
        this.toast.error(err?.error?.error ?? 'Görsel yükleme başarısız.');
        this.uploading.set({ ...this.uploading(), [fieldKey]: false });
        input.value = '';
      }
    });
  }

  anyUploading() { return Object.values(this.uploading()).some(v => v); }

  save() {
    this.api.updateSetting(this.form.value).subscribe({
      next: () => this.toast.success('Site ayarları kaydedildi.'),
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }
}
