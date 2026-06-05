import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { BlogPost } from '../../core/models/models';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Blog Yazıları</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Yazı</button>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3">Başlık</th>
              <th class="text-left p-3">Slug</th>
              <th class="text-left p-3">Tarih</th>
              <th class="text-left p-3">Güncelleme</th>
              <th class="text-left p-3">Durum</th>
              <th class="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items; track item.id) {
              <tr class="border-t hover:bg-gray-50">
                <td class="p-3 font-medium max-w-xs truncate">{{ item.title }}</td>
                <td class="p-3 text-gray-400 font-mono text-xs">{{ item.slug }}</td>
                <td class="p-3 text-gray-500 text-xs">{{ formatDate(item.createdAt) }}</td>
                <td class="p-3 text-gray-400 text-xs">{{ item.updatedAt ? formatDate(item.updatedAt) : '-' }}</td>
                <td class="p-3">
                  <span [class]="item.isActive ? 'text-green-600 font-medium' : 'text-red-500'">
                    {{ item.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="p-6 text-center text-gray-400">Henüz blog yazısı yok.</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div class="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl mx-4">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="grid grid-cols-2 gap-3">
                <div class="col-span-2">
                  <label class="label">Başlık</label>
                  <input formControlName="title" class="input" placeholder="Yazı başlığı" (input)="autoSlug()" />
                  @if (form.get('title')?.invalid && form.get('title')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Başlık zorunludur.</p>
                  }
                </div>
                <div class="col-span-2">
                  <label class="label">Slug (URL)</label>
                  <input formControlName="slug" class="input font-mono" placeholder="blog-yazi-slug" />
                  @if (form.get('slug')?.invalid && form.get('slug')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Slug zorunludur.</p>
                  }
                </div>
                <div class="col-span-2">
                  <label class="label">Kapak Görseli <span class="text-gray-400 font-normal text-xs">(1200×630 — otomatik kırpılır)</span></label>
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
                         class="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
                         onerror="this.style.display='none'" />
                  }
                </div>
                <div class="col-span-2">
                  <label class="label">İçerik (HTML destekli)</label>
                  <textarea formControlName="content" class="input font-mono text-xs" rows="12"
                    placeholder="<p>Blog içeriği buraya...</p>"></textarea>
                  @if (form.get('content')?.invalid && form.get('content')?.touched) {
                    <p class="text-red-500 text-xs mt-1">İçerik zorunludur.</p>
                  }
                </div>
                <div class="flex items-center gap-2">
                  <input formControlName="isActive" type="checkbox" id="isActive" class="w-4 h-4 cursor-pointer" />
                  <label for="isActive" class="text-sm cursor-pointer">Aktif (yayında)</label>
                </div>
              </div>
              @if (errorMsg) {
                <p class="text-red-500 text-sm mt-3 bg-red-50 px-3 py-2 rounded">{{ errorMsg }}</p>
              }
              <div class="flex gap-3 mt-5">
                <button type="submit" [disabled]="saving" class="btn-primary disabled:opacity-60">
                  {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
                </button>
                <button type="button" (click)="closeForm()" class="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class BlogsComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private fb  = inject(FormBuilder);

  items: BlogPost[] = [];
  showForm = false;
  editing: BlogPost | null = null;
  saving = false;
  errorMsg = '';
  uploading   = signal(false);
  uploadError = signal('');

  form = this.fb.group({
    title:    ['', Validators.required],
    slug:     ['', Validators.required],
    content:  ['', Validators.required],
    imageUrl: [''],
    isActive: [true]
  });

  ngOnInit() { this.load(); }

  load() { this.api.getBlogPostsAdmin().subscribe(d => { this.items = d; this.cdr.markForCheck(); }); }

  openForm(item?: BlogPost) {
    this.editing  = item ?? null;
    this.showForm = true;
    this.errorMsg = '';
    this.saving   = false;
    this.uploadError.set('');
    if (item) {
      this.form.patchValue(item);
    } else {
      this.form.reset({ title: '', slug: '', content: '', imageUrl: '', isActive: true });
    }
  }

  closeForm() { this.showForm = false; this.editing = null; this.errorMsg = ''; }

  autoSlug() {
    if (this.editing) return;
    const title = this.form.get('title')?.value ?? '';
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(slug, { emitEvent: false });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.uploadError.set('');
    this.api.uploadImage(file, 'blog').subscribe({
      next: res => { this.form.patchValue({ imageUrl: res.url }); this.uploading.set(false); input.value = ''; },
      error: err => { this.uploadError.set(err?.error?.error ?? 'Yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.errorMsg = '';
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateBlogPost(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createBlogPost(dto);
    obs.subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: () => { this.saving = false; this.errorMsg = 'Kayıt sırasında hata oluştu. Slug benzersiz olmalıdır.'; }
    });
  }

  delete(item: BlogPost) {
    if (!confirm(`"${item.title}" yazısı kalıcı olarak silinsin mi?`)) return;
    this.api.deleteBlogPost(item.id).subscribe(() => this.load());
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
