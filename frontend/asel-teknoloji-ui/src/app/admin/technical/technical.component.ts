import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { TechnicalService, SERVICE_STATUS_LABELS } from '../../core/models/models';

@Component({
  selector: 'app-technical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Teknik Servis Kayıtları</h2>
      <div class="flex gap-2 mb-4 flex-wrap">
        <button (click)="filterStatus=null;applyFilter()" [class.bg-blue-700]="filterStatus===null" [class.text-white]="filterStatus===null" class="px-3 py-1 rounded border text-sm">Tümü</button>
        @for (s of statusList; track s.value) {
          <button (click)="filterStatus=s.value;applyFilter()" [class.bg-blue-700]="filterStatus===s.value" [class.text-white]="filterStatus===s.value" class="px-3 py-1 rounded border text-sm">{{ s.label }}</button>
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
            @for (item of filtered; track item.id) {
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
          </tbody>
        </table>
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
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  items: TechnicalService[] = [];
  filtered: TechnicalService[] = [];
  filterStatus: number | null = null;
  editing: TechnicalService | null = null;
  editStatus = 0;
  editNote   = '';
  statusList = Object.entries(SERVICE_STATUS_LABELS).map(([v, l]) => ({ value: +v, label: l }));

  ngOnInit() { this.load(); }
  load() { this.api.getTechnicalServices().subscribe(d => { this.items = d; this.applyFilter(); this.cdr.markForCheck(); }); }
  applyFilter() { this.filtered = this.filterStatus === null ? this.items : this.items.filter(i => i.status === this.filterStatus); }
  openEdit(item: TechnicalService) { this.editing = item; this.editStatus = item.status; this.editNote = item.adminNote ?? ''; }
  saveEdit() {
    if (!this.editing) return;
    this.api.updateTechnicalService(this.editing.id, { status: this.editStatus, adminNote: this.editNote }).subscribe(() => { this.editing = null; this.load(); });
  }
  statusClass(s: number) {
    const m: Record<number,string> = { 0:'bg-yellow-100 text-yellow-700', 1:'bg-blue-100 text-blue-700', 2:'bg-orange-100 text-orange-700', 3:'bg-green-100 text-green-700', 4:'bg-red-100 text-red-700' };
    return m[s] ?? 'bg-gray-100 text-gray-700';
  }
}
