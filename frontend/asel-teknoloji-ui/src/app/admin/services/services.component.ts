import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Service, Category } from '../../core/models/models';
import { WysiwygComponent } from '../../shared/wysiwyg/wysiwyg.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WysiwygComponent],
  templateUrl: './services.component.html'
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
