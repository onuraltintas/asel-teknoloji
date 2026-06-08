import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Portfolio } from '../../core/models/models';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './portfolio.component.html'
})
export class PortfolioComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: Portfolio[] = [];
  showForm = false;
  editing: Portfolio | null = null;
  uploading = signal(false);
  imagesList: string[] = [];

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
    title:        ['', Validators.required],
    slug:         ['', Validators.required],
    description:  [''],
    tags:         [''],
    displayOrder: [1],
    isActive:     [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getPortfoliosAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} proje silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deletePortfolio(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} proje silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: Portfolio) {
    this.editing = item ?? null;
    this.showForm = true;
    this.imagesList = item?.images ? this.parseImages(item.images) : [];
    this.form.patchValue(item
      ? { title: item.title, slug: item.slug, description: item.description ?? '', tags: item.tags ?? '', displayOrder: item.displayOrder, isActive: item.isActive }
      : { title: '', slug: '', description: '', tags: '', displayOrder: 1, isActive: true }
    );
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
    const files = input.files;
    if (!files || files.length === 0) return;
    this.uploading.set(true);
    const uploads = Array.from(files).map(file => this.api.uploadImage(file, 'portfolio'));
    forkJoin(uploads).subscribe({
      next: results => {
        this.imagesList = [...this.imagesList, ...results.map(r => r.url)];
        this.uploading.set(false);
        input.value = '';
      },
      error: err => { this.toast.error(err?.error?.error ?? 'Görsel yükleme başarısız.'); this.uploading.set(false); input.value = ''; }
    });
  }

  removeImage(index: number) {
    this.imagesList = this.imagesList.filter((_, i) => i !== index);
  }

  parseImages(json: string): string[] {
    try { return JSON.parse(json); } catch { return json ? [json] : []; }
  }

  getCoverImage(item: Portfolio): string | null {
    const imgs = this.parseImages(item.images ?? '');
    return imgs[0] ?? null;
  }

  save() {
    if (this.form.invalid || this.uploading()) return;
    const dto = {
      ...this.form.value,
      images: this.imagesList.length ? JSON.stringify(this.imagesList) : null
    } as any;
    const obs = this.editing
      ? this.api.updatePortfolio(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createPortfolio(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Proje güncellendi.' : 'Proje oluşturuldu.'); },
      error: () => this.toast.error('Kayıt başarısız. Slug benzersiz olmalıdır.')
    });
  }

  delete(item: Portfolio) {
    this.toast.confirm(`"${item.title}" projesi silinsin mi?`, () => {
      this.api.deletePortfolio(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Proje silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
