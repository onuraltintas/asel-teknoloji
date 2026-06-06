import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { TechnicalService, SERVICE_STATUS_LABELS } from '../../core/models/models';

@Component({
  selector: 'app-technical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './technical.component.html'
})
export class TechnicalComponent implements OnInit {
  private api   = inject(ApiService);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: TechnicalService[] = [];
  filtered: TechnicalService[] = [];
  filterStatus: number | null = null;
  editing: TechnicalService | null = null;
  editStatus = 0;
  editNote   = '';
  statusList = Object.entries(SERVICE_STATUS_LABELS).map(([v, l]) => ({ value: +v, label: l }));

  page            = 1;
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50, 100];

  get totalPages()  { return Math.ceil(this.filtered.length / this.pageSize); }
  get paged()       { return this.filtered.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageNumbers() {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, this.page, this.page - 1, this.page + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }
  min(a: number, b: number) { return Math.min(a, b); }

  ngOnInit() { this.load(); }

  load() {
    this.api.getTechnicalServices().subscribe(d => {
      this.items = d;
      this.applyFilter();
      this.cdr.markForCheck();
    });
  }

  setFilter(status: number | null) {
    this.filterStatus = status;
    this.page = 1;
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.filterStatus === null ? this.items : this.items.filter(i => i.status === this.filterStatus);
    if (this.page > this.totalPages) this.page = Math.max(1, this.totalPages);
  }

  changePageSize(event: Event) { this.pageSize = +(event.target as HTMLSelectElement).value; this.page = 1; }
  goTo(p: number) { if (p < 1 || p > this.totalPages) return; this.page = p; }

  openEdit(item: TechnicalService) { this.editing = item; this.editStatus = item.status; this.editNote = item.adminNote ?? ''; }

  saveEdit() {
    if (!this.editing) return;
    this.api.updateTechnicalService(this.editing.id, { status: +this.editStatus, adminNote: this.editNote }).subscribe({
      next: () => { this.editing = null; this.load(); this.toast.success('Servis kaydı güncellendi.'); },
      error: () => this.toast.error('Güncelleme başarısız.')
    });
  }

  statusClass(s: number) {
    const m: Record<number,string> = { 0:'bg-yellow-100 text-yellow-700', 1:'bg-blue-100 text-blue-700', 2:'bg-orange-100 text-orange-700', 3:'bg-green-100 text-green-700', 4:'bg-red-100 text-red-700' };
    return m[s] ?? 'bg-gray-100 text-gray-700';
  }
}
