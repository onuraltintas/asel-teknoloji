import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Service, Category } from '../../core/models/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Hizmetler</h2>
        <div class="flex items-center gap-3">
          @if (selected.size > 0) {
            <button (click)="deleteSelected()"
                    class="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              🗑 Seçilenleri Sil ({{ selected.size }})
            </button>
          }
          <button (click)="openForm()" class="btn-primary">+ Yeni Hizmet</button>
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
              <th class="p-3 w-16"></th>
              <th class="text-left p-3">Başlık</th>
              <th class="text-left p-3">Kategori</th>
              <th class="text-left p-3">Slug</th>
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
                    <img [src]="item.imageUrl" [alt]="item.title"
                         class="w-14 h-10 object-cover rounded border border-gray-100"
                         onerror="this.style.display='none'" />
                  } @else {
                    <div class="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-lg">🖼</div>
                  }
                </td>
                <td class="p-3 font-medium">{{ item.title }}</td>
                <td class="p-3 text-gray-500">{{ item.categoryName }}</td>
                <td class="p-3 text-gray-400 font-mono text-xs">{{ item.slug }}</td>
                <td class="p-3"><span [class]="item.isActive ? 'text-green-600' : 'text-red-500'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span></td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="7" class="p-6 text-center text-gray-400">Henüz hizmet yok.</td></tr>
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
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col" style="max-height:90vh">
            <div class="px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
              <h3 class="font-bold text-lg">{{ editing ? 'Hizmet Düzenle' : 'Yeni Hizmet' }}</h3>
            </div>
            <div class="overflow-y-auto flex-1 px-5 py-4">
              <form [formGroup]="form" (ngSubmit)="save()" id="serviceForm">
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="label">Kategori</label>
                    <select formControlName="categoryId" class="input">
                      @for (c of categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
                    </select>
                  </div>
                  <div class="flex items-end pb-1.5 gap-2">
                    <input formControlName="isActive" type="checkbox" class="w-4 h-4" />
                    <label class="text-sm">Aktif</label>
                  </div>
                  <div class="col-span-2"><label class="label">Başlık</label><input formControlName="title" class="input" (input)="autoSlug()" /></div>
                  <div class="col-span-2"><label class="label">Slug <span class="text-gray-400 font-normal text-xs">(otomatik, düzenlenebilir)</span></label><input formControlName="slug" class="input font-mono" /></div>
                  <div class="col-span-2"><label class="label">Kısa Açıklama</label><textarea formControlName="shortDescription" class="input" rows="2"></textarea></div>
                  <div class="col-span-2"><label class="label">Açıklama (HTML)</label><textarea formControlName="description" class="input" rows="4"></textarea></div>
                  <div class="col-span-2">
                    <label class="label">Görsel <span class="text-gray-400 font-normal text-xs">(1200×630 — otomatik kırpılır)</span></label>
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
                           class="mt-2 h-20 w-full object-cover rounded-lg border border-gray-200"
                           onerror="this.style.display='none'" />
                    }
                  </div>
                  <div><label class="label">Meta Başlık <span class="text-gray-400 font-normal">(max 70)</span></label><input formControlName="metaTitle" class="input" /></div>
                  <div><label class="label">Meta Açıklama <span class="text-gray-400 font-normal">(max 160)</span></label><input formControlName="metaDescription" class="input" /></div>
                </div>
              </form>
            </div>
            <div class="px-5 py-3 border-t border-gray-100 shrink-0 flex gap-3">
              <button type="submit" form="serviceForm" [disabled]="uploading()" class="btn-primary disabled:opacity-50">Kaydet</button>
              <button type="button" (click)="showForm=false" class="btn-secondary">İptal</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: Service[] = [];
  categories: Category[] = [];
  showForm = false;
  editing: Service | null = null;
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
    categoryId: [0, Validators.required], title: ['', Validators.required], slug: ['', Validators.required],
    shortDescription: [''], description: [''], imageUrl: [''], metaTitle: [''], metaDescription: [''], isActive: [true]
  });

  ngOnInit() {
    this.load();
    this.api.getCategoriesAdmin().subscribe(d => { this.categories = d; this.cdr.markForCheck(); });
  }

  load() {
    this.api.getServicesAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} hizmet silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteService(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} hizmet silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: Service) {
    this.editing = item ?? null; this.showForm = true;
    if (item) { this.form.patchValue(item); }
    else { this.form.reset({ categoryId: 0, title: '', slug: '', shortDescription: '', description: '', imageUrl: '', metaTitle: '', metaDescription: '', isActive: true }); }
  }

  autoSlug() {
    if (this.editing) return;
    const title = this.form.get('title')?.value ?? '';
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(slug, { emitEvent: false });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadImage(file, 'service').subscribe({
      next: res => { this.form.patchValue({ imageUrl: res.url }); this.uploading.set(false); input.value = ''; },
      error: err => { this.toast.error(err?.error?.error ?? 'Görsel yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateService(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createService(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Hizmet güncellendi.' : 'Hizmet oluşturuldu.'); },
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }

  delete(item: Service) {
    this.toast.confirm(`"${item.title}" hizmeti silinsin mi?`, () => {
      this.api.deleteService(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Hizmet silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
