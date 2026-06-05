import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Reference } from '../../core/models/models';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Referanslar</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Referans</button>
      </div>

      <div class="grid gap-4">
        @for (item of items; track item.id) {
          <div class="card flex items-center gap-4">
            @if (item.imageUrl) {
              <img [src]="item.imageUrl" [alt]="item.name"
                   class="w-20 h-14 object-contain rounded border border-gray-100 bg-gray-50 p-1 shrink-0"
                   onerror="this.src='https://placehold.co/80x56?text=LOGO'" />
            } @else {
              <div class="w-20 h-14 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">Logo yok</div>
            }
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-800">{{ item.name }}</div>
              @if (item.description) {
                <div class="text-gray-500 text-sm truncate">{{ item.description }}</div>
              }
              @if (item.website) {
                <a [href]="item.website" target="_blank" class="text-blue-600 text-xs hover:underline">{{ item.website }}</a>
              }
              <div class="text-xs text-gray-400 mt-1">Sıra: {{ item.displayOrder }} · {{ item.isActive ? 'Aktif' : 'Pasif' }}</div>
            </div>
            <div class="flex gap-3 shrink-0">
              <button (click)="openForm(item)" class="text-blue-600 hover:underline text-sm">Düzenle</button>
              <button (click)="delete(item)" class="text-red-500 hover:underline text-sm">Sil</button>
            </div>
          </div>
        }
        @empty {
          <div class="card text-center text-gray-400 py-10">Henüz referans eklenmemiş.</div>
        }
      </div>

      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-screen overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Referans Düzenle' : 'Yeni Referans' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="space-y-3">
                <div>
                  <label class="label">Firma / Kurum Adı *</label>
                  <input formControlName="name" class="input" placeholder="Örn: ABC Şirketi" />
                </div>
                <div>
                  <label class="label">Açıklama</label>
                  <textarea formControlName="description" class="input" rows="2"
                            placeholder="Kısa açıklama (opsiyonel)"></textarea>
                </div>
                <div>
                  <label class="label">Logo <span class="text-gray-400 font-normal text-xs">(400×300 — otomatik kırpılır)</span></label>
                  <div class="flex gap-2">
                    <input formControlName="imageUrl" class="input flex-1" placeholder="https://... veya dosya yükle" />
                    <label class="flex items-center gap-1.5 cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                           [class.opacity-50]="uploading()" [class.cursor-not-allowed]="uploading()">
                      @if (uploading()) {
                        <span class="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>Yükleniyor...
                      } @else { 📁 Dosya Seç }
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden"
                             [attr.disabled]="uploading() ? true : null" (change)="onFileSelect($event)" />
                    </label>
                  </div>
                  @if (uploadError()) { <p class="text-red-600 text-xs mt-1">{{ uploadError() }}</p> }
                  @if (form.get('imageUrl')?.value) {
                    <img [src]="form.get('imageUrl')?.value" alt="Önizleme"
                         class="mt-2 h-16 object-contain border border-gray-200 rounded p-1"
                         onerror="this.style.display='none'" />
                  }
                </div>
                <div>
                  <label class="label">Web Sitesi</label>
                  <input formControlName="website" class="input" placeholder="https://firma.com" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="label">Sıra</label>
                    <input formControlName="displayOrder" type="number" class="input" min="1" />
                  </div>
                  <div class="flex items-end pb-2 gap-2">
                    <input formControlName="isActive" type="checkbox" class="w-4 h-4" id="refActive" />
                    <label for="refActive" class="text-sm cursor-pointer">Aktif</label>
                  </div>
                </div>
              </div>
              <div class="flex gap-3 mt-5">
                <button type="submit" [disabled]="form.invalid" class="btn-primary disabled:opacity-50">Kaydet</button>
                <button type="button" (click)="showForm = false" class="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ReferencesComponent implements OnInit {
  private api = inject(ApiService);
  private fb  = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  items: Reference[] = [];
  showForm = false;
  editing: Reference | null = null;
  uploading   = signal(false);
  uploadError = signal('');

  form = this.fb.group({
    name:         ['', Validators.required],
    description:  [''],
    imageUrl:     [''],
    website:      [''],
    displayOrder: [1],
    isActive:     [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getReferencesAdmin().subscribe(d => { this.items = d; this.cdr.markForCheck(); });
  }

  openForm(item?: Reference) {
    this.editing = item ?? null;
    this.showForm = true;
    this.uploadError.set('');
    this.form.patchValue(item ?? { name: '', description: '', imageUrl: '', website: '', displayOrder: 1, isActive: true });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.api.uploadImage(file, 'reference').subscribe({
      next: res => { this.form.patchValue({ imageUrl: res.url }); this.uploading.set(false); input.value = ''; },
      error: err => { this.uploadError.set(err?.error?.error ?? 'Yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateReference(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createReference(dto);
    obs.subscribe(() => { this.showForm = false; this.load(); });
  }

  delete(item: Reference) {
    if (!confirm(`"${item.name}" silinsin mi?`)) return;
    this.api.deleteReference(item.id).subscribe(() => this.load());
  }
}
