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
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Teknik Servis Kayıtları</h2>

      <div class="flex gap-2 mb-4 flex-wrap">
        <button (click)="setFilter(null)" [class.bg-blue-700]="filterStatus===null" [class.text-white]="filterStatus===null"
                class="px-3 py-1 rounded border text-sm">Tümü</button>
        @for (s of statusList; track s.value) {
          <button (click)="setFilter(s.value)" [class.bg-blue-700]="filterStatus===s.value" [class.text-white]="filterStatus===s.value"
                  class="px-3 py-1 rounded border text-sm">{{ s.label }}</button>
        }
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="text-left p-3">Kod</th><th class="text-left p-3">Müşteri</th>
            <th class="text-left p-3">Cihaz</th><th class="text-left p-3">Tarih</th>
            <th class="text-left p-3">Durum</th><th class="text-left p-3">İşlem</th>
          </tr></thead>
          <tbody>
            @for (item of paged; track item.id) {
              <tr class="border-t hover:bg-gray-50">
                <td class="p-3 font-mono font-bold text-blue-700">{{ item.serviceCode }}</td>
                <td class="p-3"><div>{{ item.customerName }}</div><div class="text-gray-400 text-xs">{{ item.customerPhone }}</div></td>
                <td class="p-3">{{ item.deviceType }}</td>
                <td class="p-3 text-gray-500">{{ item.createdAt | date:'dd.MM.yyyy' }}</td>
                <td class="p-3"><span [class]="statusClass(item.status)" class="px-2 py-1 rounded text-xs font-medium">{{ item.statusLabel }}</span></td>
                <td class="p-3"><button (click)="openEdit(item)" class="text-blue-600 hover:underline text-xs">Güncelle</button></td>
              </tr>
              <tr class="bg-gray-50 border-t">
                <td colspan="6" class="px-3 pb-2 text-xs text-gray-500">
                  <strong>Arıza:</strong> {{ item.issueDescription }}
                  @if (item.adminNote) { <span class="ml-4"><strong>Not:</strong> {{ item.adminNote }}</span> }
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="p-6 text-center text-gray-400">Kayıt yok.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between mt-4 flex-wrap gap-2">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          @if (filtered.length > 0) {
            <span>{{ (page - 1) * pageSize + 1 }}–{{ min(page * pageSize, filtered.length) }} / {{ filtered.length }}</span>
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

      @if (editing) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="font-bold text-lg mb-4">Durum Güncelle — {{ editing.serviceCode }}</h3>
            <div class="mb-4"><label class="label">Durum</label>
              <select [(ngModel)]="editStatus" class="input">
                @for (s of statusList; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
              </select>
            </div>
            <div class="mb-4"><label class="label">Admin Notu</label>
              <textarea [(ngModel)]="editNote" class="input" rows="3"></textarea>
            </div>
            <div class="flex gap-3">
              <button (click)="saveEdit()" class="btn-primary">Kaydet</button>
              <button (click)="editing=null" class="btn-secondary">İptal</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
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
    this.api.updateTechnicalService(this.editing.id, { status: this.editStatus, adminNote: this.editNote }).subscribe({
      next: () => { this.editing = null; this.load(); this.toast.success('Servis kaydı güncellendi.'); },
      error: () => this.toast.error('Güncelleme başarısız.')
    });
  }

  statusClass(s: number) {
    const m: Record<number,string> = { 0:'bg-yellow-100 text-yellow-700', 1:'bg-blue-100 text-blue-700', 2:'bg-orange-100 text-orange-700', 3:'bg-green-100 text-green-700', 4:'bg-red-100 text-red-700' };
    return m[s] ?? 'bg-gray-100 text-gray-700';
  }
}
