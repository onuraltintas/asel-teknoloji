import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Kategoriler</h2>
        <div class="flex items-center gap-3">
          @if (selected.size > 0) {
            <button (click)="deleteSelected()"
                    class="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              🗑 Seçilenleri Sil ({{ selected.size }})
            </button>
          }
          <button (click)="openForm()" class="btn-primary">+ Yeni Kategori</button>
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
              <th class="text-left p-3">Ad</th>
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
                <td class="p-3 font-medium">{{ item.name }}</td>
                <td class="p-3 text-gray-500 font-mono text-xs">{{ item.slug }}</td>
                <td class="p-3"><span [class]="item.isActive ? 'text-green-600' : 'text-red-500'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span></td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="5" class="p-6 text-center text-gray-400">Henüz kategori yok.</td></tr>
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
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Düzenle' : 'Yeni Kategori' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="mb-3"><label class="label">Ad</label><input formControlName="name" class="input" (input)="autoSlug()" /></div>
              <div class="mb-3"><label class="label">Slug <span class="text-gray-400 font-normal text-xs">(otomatik, düzenlenebilir)</span></label><input formControlName="slug" class="input font-mono" /></div>
              <div class="mb-4 flex items-center gap-2"><input formControlName="isActive" type="checkbox" class="w-4 h-4" /><label class="text-sm">Aktif</label></div>
              <div class="flex gap-3">
                <button type="submit" class="btn-primary">Kaydet</button>
                <button type="button" (click)="showForm=false" class="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: Category[] = [];
  showForm = false;
  editing: Category | null = null;

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

  form = this.fb.group({ name: ['', Validators.required], slug: ['', Validators.required], isActive: [true] });

  ngOnInit() { this.load(); }

  load() {
    this.api.getCategoriesAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} kategori silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteCategory(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} kategori silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: Category) {
    this.editing = item ?? null; this.showForm = true;
    this.form.patchValue(item ?? { name: '', slug: '', isActive: true });
  }

  autoSlug() {
    if (this.editing) return;
    const name = this.form.get('name')?.value ?? '';
    const slug = name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(slug, { emitEvent: false });
  }

  save() {
    if (this.form.invalid) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateCategory(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createCategory(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.'); },
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }

  delete(item: Category) {
    this.toast.confirm(`"${item.name}" kategorisi silinsin mi?`, () => {
      this.api.deleteCategory(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Kategori silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
