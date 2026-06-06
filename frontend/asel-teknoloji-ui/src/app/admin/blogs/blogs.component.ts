import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { BlogPost } from '../../core/models/models';
import { WysiwygComponent } from '../../shared/wysiwyg/wysiwyg.component';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WysiwygComponent],
  templateUrl: './blogs.component.html'
})
export class BlogsComponent implements OnInit {
  private api   = inject(ApiService);
  private cdr   = inject(ChangeDetectorRef);
  private fb    = inject(FormBuilder);
  private toast = inject(ToastService);

  items: BlogPost[] = [];
  showForm = false;
  editing: BlogPost | null = null;
  saving = false;
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
    title: ['', Validators.required], slug: ['', Validators.required],
    content: ['', Validators.required], imageUrl: [''], isActive: [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getBlogPostsAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} blog yazısı silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteBlogPost(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} blog yazısı silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: BlogPost) {
    this.editing = item ?? null; this.showForm = true; this.saving = false;
    if (item) { this.form.patchValue(item); }
    else { this.form.reset({ title: '', slug: '', content: '', imageUrl: '', isActive: true }); }
  }

  closeForm() { this.showForm = false; this.editing = null; }

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
    this.api.uploadImage(file, 'blog').subscribe({
      next: res => { this.form.patchValue({ imageUrl: res.url }); this.uploading.set(false); input.value = ''; },
      error: err => { this.toast.error(err?.error?.error ?? 'Görsel yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  save() {
    if (this.form.invalid || this.uploading()) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateBlogPost(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createBlogPost(dto);
    obs.subscribe({
      next: () => { this.closeForm(); this.load(); this.toast.success(this.editing ? 'Blog yazısı güncellendi.' : 'Blog yazısı oluşturuldu.'); },
      error: () => { this.saving = false; this.toast.error('Kayıt başarısız. Slug benzersiz olmalıdır.'); }
    });
  }

  delete(item: BlogPost) {
    this.toast.confirm(`"${item.title}" yazısı silinsin mi?`, () => {
      this.api.deleteBlogPost(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Blog yazısı silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
