import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Kategoriler</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Kategori</button>
      </div>
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="text-left p-3">Ad</th><th class="text-left p-3">Slug</th>
            <th class="text-left p-3">Durum</th><th class="text-left p-3">İşlem</th>
          </tr></thead>
          <tbody>
            @for (item of items; track item.id) {
              <tr class="border-t hover:bg-gray-50">
                <td class="p-3 font-medium">{{ item.name }}</td>
                <td class="p-3 text-gray-500 font-mono text-xs">{{ item.slug }}</td>
                <td class="p-3"><span [class]="item.isActive ? 'text-green-600' : 'text-red-500'">{{ item.isActive ? 'Aktif' : 'Pasif' }}</span></td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
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
  form = this.fb.group({ name: ['', Validators.required], slug: ['', Validators.required], isActive: [true] });

  ngOnInit() { this.load(); }
  load() { this.api.getCategoriesAdmin().subscribe(d => { this.items = d; this.cdr.markForCheck(); }); }

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
