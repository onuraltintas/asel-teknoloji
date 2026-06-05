import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Service, Category } from '../../core/models/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Hizmetler</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Hizmet</button>
      </div>
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="text-left p-3">Başlık</th><th class="text-left p-3">Kategori</th>
            <th class="text-left p-3">Slug</th><th class="text-left p-3">Durum</th><th class="text-left p-3">İşlem</th>
          </tr></thead>
          <tbody>
            @for (item of items; track item.id) {
              <tr class="border-t hover:bg-gray-50">
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
          </tbody>
        </table>
      </div>
      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Hizmet Düzenle' : 'Yeni Hizmet' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="grid grid-cols-2 gap-3">
                <div><label class="label">Kategori</label>
                  <select formControlName="categoryId" class="input">
                    @for (c of categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
                  </select>
                </div>
                <div class="flex items-end pb-2 gap-2"><input formControlName="isActive" type="checkbox" class="w-4 h-4" /><label class="text-sm">Aktif</label></div>
                <div class="col-span-2"><label class="label">Başlık</label><input formControlName="title" class="input" /></div>
                <div class="col-span-2"><label class="label">Slug</label><input formControlName="slug" class="input" /></div>
                <div class="col-span-2"><label class="label">Kısa Açıklama</label><textarea formControlName="shortDescription" class="input" rows="2"></textarea></div>
                <div class="col-span-2"><label class="label">Açıklama (HTML)</label><textarea formControlName="description" class="input" rows="5"></textarea></div>
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
                         class="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
                         onerror="this.style.display='none'" />
                  }
                </div>
                <div><label class="label">Meta Başlık (max 70)</label><input formControlName="metaTitle" class="input" /></div>
                <div><label class="label">Meta Açıklama (max 160)</label><input formControlName="metaDescription" class="input" /></div>
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

  form = this.fb.group({
    categoryId: [0, Validators.required], title: ['', Validators.required], slug: ['', Validators.required],
    shortDescription: [''], description: [''], imageUrl: [''], metaTitle: [''], metaDescription: [''], isActive: [true]
  });

  ngOnInit() { this.load(); this.api.getCategoriesAdmin().subscribe(d => { this.categories = d; this.cdr.markForCheck(); }); }
  load() { this.api.getServicesAdmin().subscribe(d => { this.items = d; this.cdr.markForCheck(); }); }

  openForm(item?: Service) {
    this.editing = item ?? null; this.showForm = true;
    if (item) { this.form.patchValue(item); }
    else { this.form.reset({ categoryId: 0, title: '', slug: '', shortDescription: '', description: '', imageUrl: '', metaTitle: '', metaDescription: '', isActive: true }); }
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
