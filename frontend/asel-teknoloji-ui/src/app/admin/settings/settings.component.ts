import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Site Ayarları</h2>
      <div class="card max-w-2xl">
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="grid grid-cols-2 gap-4">
            @for (field of fields; track field.key) {
              <div [class.col-span-2]="field.full">
                <label class="label">{{ field.label }}</label>

                @if (field.key === 'logoUrl' || field.key === 'faviconUrl') {
                  <div class="flex gap-2">
                    <input [formControlName]="field.key" class="input flex-1" placeholder="https://... veya dosya yükle" />
                    <label class="flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                           [class.opacity-50]="uploading()[field.key]" [class.cursor-not-allowed]="uploading()[field.key]">
                      @if (uploading()[field.key]) {
                        <span class="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>Yükleniyor...
                      } @else { 📁 Dosya Seç }
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden"
                             [attr.disabled]="uploading()[field.key] ? true : null"
                             (change)="onFileSelect($event, field.key)" />
                    </label>
                  </div>
                  @if (form.get(field.key)?.value) {
                    <img [src]="form.get(field.key)?.value" [alt]="field.label"
                         class="mt-2 h-14 object-contain border border-gray-200 rounded p-1 bg-gray-50"
                         onerror="this.style.display='none'" />
                  }
                } @else if (field.textarea) {
                  <textarea [formControlName]="field.key" class="input" rows="3"></textarea>
                } @else {
                  <input [formControlName]="field.key" [type]="field.type || 'text'" class="input" />
                }
              </div>
            }
          </div>
          <div class="mt-6">
            <button type="submit" [disabled]="anyUploading()" class="btn-primary disabled:opacity-50">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private toast = inject(ToastService);

  uploading = signal<Record<string, boolean>>({});

  fields = [
    { key: 'title',         label: 'Site Başlığı',           full: true },
    { key: 'description',   label: 'Açıklama',               full: true, textarea: true },
    { key: 'keywords',      label: 'Anahtar Kelimeler',       full: true },
    { key: 'phone',         label: 'Telefon' },
    { key: 'email',         label: 'E-posta',                 type: 'email' },
    { key: 'address',       label: 'Adres',                   full: true, textarea: true },
    { key: 'facebook',      label: 'Facebook URL' },
    { key: 'instagram',     label: 'Instagram URL' },
    { key: 'linkedin',      label: 'LinkedIn URL' },
    { key: 'logoUrl',       label: 'Logo (400×200)',          full: true },
    { key: 'faviconUrl',    label: 'Favicon (64×64)',         full: true },
    { key: 'mapsEmbedCode', label: 'Google Maps Embed Kodu', full: true, textarea: true },
  ];

  form = this.fb.group({
    title: [''], description: [''], keywords: [''], phone: [''], email: [''],
    address: [''], facebook: [''], instagram: [''], linkedin: [''],
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
