import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
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
              <div class="mb-3"><label class="label">Ad</label><input formControlName="name" class="input" /></div>
              <div class="mb-3"><label class="label">Slug</label><input formControlName="slug" class="input" /></div>
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
  private api = inject(ApiService);
  private fb  = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
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
  save() {
    if (this.form.invalid) return;
    const dto = this.form.value as any;
    const obs = this.editing ? this.api.updateCategory(this.editing.id, { ...dto, id: this.editing.id }) : this.api.createCategory(dto);
    obs.subscribe(() => { this.showForm = false; this.load(); });
  }
  delete(item: Category) {
    if (!confirm(`"${item.name}" silinsin mi?`)) return;
    this.api.deleteCategory(item.id).subscribe(() => this.load());
  }
}
