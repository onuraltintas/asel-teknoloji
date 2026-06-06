import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { PageContent } from '../../core/models/models';

@Component({
  selector: 'app-page-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Vizyon & Misyon Sayfaları</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Sayfa</button>
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
              <th class="text-left p-3">Tür</th>
              <th class="text-left p-3">Başlık</th>
              <th class="text-left p-3">Alt Başlık</th>
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
                <td class="p-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        [class]="item.type === 'vision' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                    {{ item.type === 'vision' ? '🔭 Vizyon' : '🎯 Misyon' }}
                  </span>
                </td>
                <td class="p-3 font-medium">{{ item.title }}</td>
                <td class="p-3 text-gray-500 max-w-xs truncate">{{ item.subtitle }}</td>
                <td class="p-3"><span [class]="item.isActive ? 'text-green-600' : 'text-red-500'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span></td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="p-6 text-center text-gray-400">Henüz sayfa içeriği eklenmemiş.</td></tr>
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

      @if (selected.size > 0) {
        <div class="mt-3 flex justify-end">
          <button (click)="deleteSelected()"
                  class="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            🗑 Seçilenleri Sil ({{ selected.size }})
          </button>
        </div>
      }

      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Sayfa Düzenle' : 'Yeni Sayfa İçeriği' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="space-y-4">
                <div>
                  <label class="label">Tür *</label>
                  <select formControlName="type" class="input">
                    <option value="vision">🔭 Vizyon</option>
                    <option value="mission">🎯 Misyon</option>
                  </select>
                </div>
                <div>
                  <label class="label">Başlık *</label>
                  <input formControlName="title" class="input" placeholder="Örn: Vizyonumuz" />
                </div>
                <div>
                  <label class="label">Alt Başlık</label>
                  <input formControlName="subtitle" class="input" placeholder="Kısa açıklayıcı cümle" />
                </div>
                <div>
                  <label class="label">İçerik *</label>
                  <textarea formControlName="content" class="input" rows="8"
                            placeholder="Sayfa içeriğini buraya yazın..."></textarea>
                </div>
                <div>
                  <label class="label">Görsel URL</label>
                  <input formControlName="imageUrl" class="input" placeholder="https://..." />
                </div>
                <div class="flex items-center gap-2">
                  <input formControlName="isActive" type="checkbox" class="w-4 h-4" id="pcActive" />
                  <label for="pcActive" class="text-sm cursor-pointer">Aktif</label>
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
export class PageContentComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: PageContent[] = [];
  showForm = false;
  editing: PageContent | null = null;

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50];
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
    type: ['vision', Validators.required],
    title: ['', Validators.required],
    subtitle: [''],
    content: ['', Validators.required],
    imageUrl: [''],
    isActive: [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getPageContentsAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} kayıt silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deletePageContent(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} kayıt silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: PageContent) {
    this.editing = item ?? null;
    this.showForm = true;
    this.form.patchValue(item ?? { type: 'vision', title: '', subtitle: '', content: '', imageUrl: '', isActive: true });
  }

  save() {
    if (this.form.invalid) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updatePageContent(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createPageContent(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Sayfa güncellendi.' : 'Sayfa oluşturuldu.'); },
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }

  delete(item: PageContent) {
    this.toast.confirm(`"${item.title}" sayfası silinsin mi?`, () => {
      this.api.deletePageContent(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Sayfa silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
