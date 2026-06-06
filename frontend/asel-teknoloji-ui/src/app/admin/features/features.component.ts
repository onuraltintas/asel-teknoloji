import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Feature } from '../../core/models/models';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './features.component.html'
})
export class FeaturesComponent implements OnInit {
  private api   = inject(ApiService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: Feature[] = [];
  showForm = false;
  editing: Feature | null = null;

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
    icon: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    displayOrder: [1],
    isActive: [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.api.getFeaturesAdmin().subscribe(d => {
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
    this.toast.confirm(`${ids.length} özellik silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteFeature(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} özellik silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı kayıtlar silinemedi.'); }
      });
    }, 'Sil');
  }

  openForm(item?: Feature) {
    this.editing = item ?? null;
    this.showForm = true;
    this.form.patchValue(item ?? { icon: '', title: '', description: '', displayOrder: 1, isActive: true });
  }

  save() {
    if (this.form.invalid) return;
    const dto = this.form.value as any;
    const obs = this.editing
      ? this.api.updateFeature(this.editing.id, { ...dto, id: this.editing.id })
      : this.api.createFeature(dto);
    obs.subscribe({
      next: () => { this.showForm = false; this.load(); this.toast.success(this.editing ? 'Özellik güncellendi.' : 'Özellik oluşturuldu.'); },
      error: () => this.toast.error('Kayıt sırasında hata oluştu.')
    });
  }

  delete(item: Feature) {
    this.toast.confirm(`"${item.title}" özelliği silinsin mi?`, () => {
      this.api.deleteFeature(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Özellik silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }
}
