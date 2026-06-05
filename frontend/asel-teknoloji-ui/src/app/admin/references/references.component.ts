import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Reference } from '../../core/models/models';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Referanslar</h2>
        <div class="flex items-center gap-3">
          @if (selected.size > 0) {
            <button (click)="deleteSelected()"
                    class="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              🗑 Seçilenleri Sil ({{ selected.size }})
            </button>
          }
          <button (click)="openForm()" class="btn-primary">+ Yeni Referans</button>
        </div>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 w-10">
                <input type="checkbox" class="w-4 h-4 cursor-pointer"
                       [checked]="allPageSelected" [indeterminate]="somePageSelected"
                       (change)="toggleAll($event)" />
              </th>
              <th class="p-3 w-20"></th>
              <th class="text-left p-3">Firma / Kurum</th>
              <th class="text-left p-3">Web Sitesi</th>
              <th class="text-left p-3">Sıra</th>
              <th class="text-left p-3">Durum</th>
              <th class="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            @for (item of paged; track item.id) {
              <tr class="border-t hover:bg-gray-50" [class.bg-blue-50]="selected.has(item.id)">
                <td class="p-3">
                  <input type="checkbox" class="w-4 h-4 cursor-pointer"
                         [checked]="selected.has(item.id)" (change)="toggleSelect(item.id)" />
                </td>
                <td class="p-2">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name"
                         class="w-16 h-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5"
                         onerror="this.style.display='none'" />
                  } @else {
                    <div class="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs">Logo yok</div>
                  }
                </td>
                <td class="p-3 font-medium">{{ item.name }}</td>
                <td class="p-3 text-gray-400 text-xs">
                  @if (item.website) { <a [href]="item.website" target="_blank" class="text-blue-600 hover:underline">{{ item.website }}</a> }
                  @else { — }
                </td>
                <td class="p-3 text-gray-500">{{ item.displayOrder }}</td>
                <td class="p-3"><span [class]="item.isActive ? 'text-green-600' : 'text-red-500'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span></td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="7" class="p-6 text-center text-gray-400">Henüz referans eklenmemiş.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          @if (items.length > 0) {
            <span>{{ (page - 1) * pageSize + 1 }}–{{ min(page * pageSize, items.length) }} / {{ items.length }}</span>
          } @else { <span>0 kayıt</span> }
          <select (change)="changePageSize($event)"
                  class="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            @for (s of pageSizeOptions; track s) { <option [value]="s" [selected]="s === pageSize">{{ s }}</option> }
          </select>
          <span>/ sayfa</span>
        </div>
        <div class="flex items-center gap-1">
          <button (click)="goTo(page - 1)" [disabled]="page === 1 || totalPages === 0"
                  class="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">‹ Önceki</button>
          @for (p of pageNumbers; track p) {
            <button (click)="goTo(p)" class="w-8 h-8 rounded-lg text-sm transition-colors"
                    [class.bg-blue-600]="p === page" [class.text-white]="p === page"
                    [class.hover:bg-gray-100]="p !== page">{{ p }}</button>
          }
          <button (click)="goTo(page + 1)" [disabled]="page === totalPages || totalPages === 0"
                  class="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">Sonraki ›</button>
        </div>
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
                  <textarea formControlName="description" class="input" rows="2" placeholder="Kısa açıklama (opsiyonel)"></textarea>
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
                  <div><label class="label">Sıra</label><input formControlName="displayOrder" type="number" class="input" min="1" /></div>
                  <div class="flex items-end pb-2 gap-2">
                    <input formControlName="isActive" type="checkbox" class="w-4 h-4" id="refActive" />
                    <label for="refActive" class="text-sm cursor-pointer">Aktif</label>
                  </div>
                </div>
              </div>
              <div class="flex gap-3 mt-5">
                <button type="submit" [disabled]="form.invalid || uploading()" class="btn-primary disabled:opacity-50">Kaydet</button>
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
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: Reference[] = [];
  showForm = false;
  editing: Reference | null = null;
  uploading = signal(false);

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];
  selected        = new Set<number>();

  get totalPages()  { return Math.ceil(this.items.length / this.pageSize); }
  get paged()       { return this.items.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageNumbers() {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, this.page, this.page - 1, this.page + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }
  get allPageSelected()  { return this.paged.length > 0 && this.paged.every(m => this.selected.has(m.id)); }
  get somePageSelected() { return this.paged.some(m => this.selected.has(m.id)) && !this.allPageSelected; }
  min(a: number, b: number) { return Math.min(a, b); }

  form = this.fb.group({
    name: ['', Validators.required], description: [''], imageUrl: [''],
    website: [''], displayOrder: [1], isActive: [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getReferencesAdmin().subscribe(d => {
      this.items = d;
      this.selected.clear();
      if (this.page > this.totalPages) this.page = Math.max(1, this.totalPages);
      this.cdr.markForCheck();
    });
  }

  changePageSize(event: Event) { this.pageSize = +(event.target as HTMLSelectElement).value; this.page = 1; this.selected = new Set(); }
  goTo(p: number) { if (p < 1 || p > this.totalPages) return; this.page = p; this.selected.clear(); }
  toggleSelect(id: number) { this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id); this.selected = new Set(this.selected); }
  toggleAll(event: Event) {
    if ((event.target as HTMLInputElement).checked) this.paged.forEach(m => this.selected.add(m.id));
    else this.paged.forEach(m => this.selected.delete(m.id));
    this.selected = new Set(this.selected);
  }
  deleteSelected() {
    const ids = [...this.selected];
    this.toast.confirm(`${ids.length} referans silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteReference(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} referans silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: Reference) {
    this.editing = item ?? null; this.showForm = true;
    this.form.patchValue(item ?? { name: '', description: '', imageUrl: '', website: '', displayOrder: 1, isActive: true });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadImage(file, 'reference').subscribe({
      next: res => { this.form.patchValue({ imageUrl: res.url }); this.uploading.set(false); input.value = ''; },
      error: err => { this.toast.error(err?.error?.error ?? 'Görsel yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateReference(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createReference(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Referans güncellendi.' : 'Referans oluşturuldu.'); },
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }

  delete(item: Reference) {
    this.toast.confirm(`"${item.name}" referansı silinsin mi?`, () => {
      this.api.deleteReference(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Referans silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
