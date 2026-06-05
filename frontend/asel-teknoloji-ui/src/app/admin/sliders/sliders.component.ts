import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Slider } from '../../core/models/models';

@Component({
  selector: 'app-sliders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Sliderlar</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Slider</button>
      </div>
      <div class="grid gap-4">
        @for (item of items; track item.id) {
          <div class="card flex items-center gap-4">
            <img [src]="item.imageUrl" [alt]="item.title" class="w-24 h-16 object-cover rounded"
                 onerror="this.src='https://placehold.co/96x64?text=IMG'" />
            <div class="flex-1">
              <div class="font-semibold">{{ item.title }}</div>
              <div class="text-gray-500 text-sm">{{ item.subTitle }}</div>
              <div class="text-xs text-gray-400 mt-1">Sıra: {{ item.displayOrder }} · {{ item.isActive ? 'Aktif' : 'Pasif' }}</div>
            </div>
            <div class="flex gap-3">
              <button (click)="openForm(item)" class="text-blue-600 hover:underline text-sm">Düzenle</button>
              <button (click)="delete(item)" class="text-red-500 hover:underline text-sm">Sil</button>
            </div>
          </div>
        }
        @if (items.length === 0) {
          <div class="card text-center text-gray-400">Henüz slider yok.</div>
        }
      </div>

      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Slider Düzenle' : 'Yeni Slider' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2">
                  <label class="label">Başlık</label>
                  <input formControlName="title" class="input" />
                </div>
                <div class="col-span-2">
                  <label class="label">Alt Başlık</label>
                  <input formControlName="subTitle" class="input" />
                </div>

                <!-- Görsel URL + Dosya Yükle -->
                <div class="col-span-2">
                  <label class="label">Görsel <span class="text-gray-400 font-normal text-xs">(1920×580 — farklı boyutlar otomatik kırpılır)</span></label>
                  <div class="flex gap-2">
                    <input formControlName="imageUrl" class="input flex-1" placeholder="https://... veya dosya yükle" />
                    <label class="flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                           [class.opacity-50]="uploading()"
                           [class.cursor-not-allowed]="uploading()">
                      @if (uploading()) {
                        <span class="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                        Yükleniyor...
                      } @else {
                        📁 Dosya Seç
                      }
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                             class="hidden"
                             [attr.disabled]="uploading() ? true : null"
                             (change)="onFileSelect($event)" />
                    </label>
                  </div>
                  @if (uploadError()) {
                    <p class="text-red-600 text-xs mt-1">{{ uploadError() }}</p>
                  }
                  @if (form.get('imageUrl')?.value) {
                    <img [src]="form.get('imageUrl')?.value" alt="Önizleme"
                         class="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
                         onerror="this.style.display='none'" />
                  }
                </div>

                <div class="col-span-2">
                  <label class="label">Hedef URL</label>
                  <input formControlName="targetUrl" class="input" placeholder="/hizmetler veya https://..." />
                </div>
                <div>
                  <label class="label">Sıra</label>
                  <input formControlName="displayOrder" type="number" class="input" />
                </div>
                <div class="flex items-end pb-2 gap-2">
                  <input formControlName="isActive" type="checkbox" class="w-4 h-4" />
                  <label class="text-sm">Aktif</label>
                </div>
              </div>
              <div class="flex gap-3 mt-4">
                <button type="submit" [disabled]="uploading()" class="btn-primary disabled:opacity-50">Kaydet</button>
                <button type="button" (click)="showForm=false" class="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SlidersComponent implements OnInit {
  private api = inject(ApiService);
  private fb  = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  items: Slider[] = [];
  showForm = false;
  editing: Slider | null = null;
  uploading   = signal(false);
  uploadError = signal('');

  form = this.fb.group({
    title:        ['', Validators.required],
    subTitle:     [''],
    imageUrl:     ['', Validators.required],
    targetUrl:    [''],
    displayOrder: [1],
    isActive:     [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getSlidersAdmin().subscribe(d => { this.items = d; this.cdr.markForCheck(); });
  }

  openForm(item?: Slider) {
    this.editing = item ?? null;
    this.showForm = true;
    this.uploadError.set('');
    this.form.patchValue(item ?? { title: '', subTitle: '', imageUrl: '', targetUrl: '', displayOrder: 1, isActive: true });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set('');

    this.api.uploadImage(file, 'slider').subscribe({
      next: res => {
        this.form.patchValue({ imageUrl: res.url });
        this.uploading.set(false);
        input.value = '';
      },
      error: err => {
        const msg = err?.error?.error ?? 'Yükleme başarısız, tekrar deneyin.';
        this.uploadError.set(msg);
        this.uploading.set(false);
        input.value = '';
      }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateSlider(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createSlider(dto);
    obs.subscribe(() => { this.showForm = false; this.load(); });
  }

  delete(item: Slider) {
    if (!confirm(`"${item.title}" silinsin mi?`)) return;
    this.api.deleteSlider(item.id).subscribe(() => this.load());
  }
}
