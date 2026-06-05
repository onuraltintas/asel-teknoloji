import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Message } from '../../core/models/models';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <!-- Başlık + araç çubuğu -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">
          Mesajlar
          @if (unread > 0) {
            <span class="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">{{ unread }}</span>
          }
        </h2>

        <div class="flex items-center gap-3">
          @if (selected.size > 0) {
            <button (click)="deleteSelected()"
                    class="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              🗑 Seçilenleri Sil ({{ selected.size }})
            </button>
          }
          <span class="text-sm text-gray-400">
            {{ messages.length }} mesaj · {{ unread }} okunmamış
          </span>
        </div>
      </div>

      <!-- Sayfa içeriği -->
      <div class="space-y-2">
        <!-- Tümünü seç satırı -->
        @if (paged.length > 0) {
          <div class="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <input type="checkbox" class="w-4 h-4 cursor-pointer"
                   [checked]="allPageSelected"
                   [indeterminate]="somePageSelected"
                   (change)="toggleAll($event)" />
            <span class="text-sm text-gray-500">
              @if (allPageSelected) { Bu sayfadaki tümü seçili }
              @else { Bu sayfadakileri seç }
            </span>
          </div>
        }

        @for (msg of paged; track msg.id) {
          <div class="card py-3 px-4"
               [class.border-l-4]="!msg.isRead"
               [class.border-blue-500]="!msg.isRead"
               [class.bg-blue-50]="selected.has(msg.id)">
            <div class="flex items-start gap-3">
              <!-- Checkbox -->
              <input type="checkbox" class="w-4 h-4 mt-1 cursor-pointer shrink-0"
                     [checked]="selected.has(msg.id)"
                     (change)="toggleSelect(msg.id)" />

              <!-- İçerik -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  @if (!msg.isRead) { <span class="w-2 h-2 bg-blue-500 rounded-full inline-block shrink-0"></span> }
                  <span class="font-semibold text-gray-800">{{ msg.fullName }}</span>
                  <span class="text-gray-400 text-sm">{{ msg.email }}</span>
                  @if (msg.phone) { <span class="text-gray-400 text-sm">· {{ msg.phone }}</span> }
                </div>
                <div class="font-medium text-gray-700 mt-1">{{ msg.subject }}</div>
                <div class="text-gray-600 text-sm mt-1">{{ msg.body }}</div>
                <div class="text-gray-400 text-xs mt-1.5">{{ msg.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
              </div>

              <!-- Butonlar -->
              <div class="flex gap-2 shrink-0">
                @if (!msg.isRead) {
                  <button (click)="markRead(msg)" class="text-xs text-blue-600 hover:underline">Okundu</button>
                }
                <button (click)="del(msg)" class="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
          </div>
        }

        @if (messages.length === 0) {
          <div class="card text-center text-gray-400 py-10">Henüz mesaj yok.</div>
        }
      </div>

      <!-- Sayfalama -->
      @if (totalPages > 1) {
        <div class="flex items-center justify-between mt-4">
          <span class="text-sm text-gray-500">
            {{ (page - 1) * pageSize + 1 }}–{{ min(page * pageSize, messages.length) }} / {{ messages.length }}
          </span>
          <div class="flex items-center gap-1">
            <button (click)="goTo(page - 1)" [disabled]="page === 1"
                    class="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ‹ Önceki
            </button>
            @for (p of pageNumbers; track p) {
              <button (click)="goTo(p)"
                      class="w-8 h-8 rounded-lg text-sm transition-colors"
                      [class.bg-blue-600]="p === page"
                      [class.text-white]="p === page"
                      [class.hover:bg-gray-100]="p !== page">
                {{ p }}
              </button>
            }
            <button (click)="goTo(page + 1)" [disabled]="page === totalPages"
                    class="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Sonraki ›
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class MessagesComponent implements OnInit {
  private api   = inject(ApiService);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  messages: Message[] = [];
  selected = new Set<number>();
  page     = 1;
  pageSize = PAGE_SIZE;

  get unread()      { return this.messages.filter(m => !m.isRead).length; }
  get totalPages()  { return Math.ceil(this.messages.length / this.pageSize); }
  get paged()       { return this.messages.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get pageNumbers() {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    // Çok sayfa varsa: 1 … p-1 p p+1 … n
    const pages = new Set([1, total, this.page, this.page - 1, this.page + 1].filter(p => p >= 1 && p <= total));
    return [...pages].sort((a, b) => a - b);
  }

  get allPageSelected()  { return this.paged.length > 0 && this.paged.every(m => this.selected.has(m.id)); }
  get somePageSelected() { return this.paged.some(m => this.selected.has(m.id)) && !this.allPageSelected; }

  min(a: number, b: number) { return Math.min(a, b); }

  ngOnInit() { this.load(); }

  load() {
    this.api.getMessages().subscribe(d => {
      this.messages = d;
      this.selected.clear();
      if (this.page > this.totalPages) this.page = Math.max(1, this.totalPages);
      this.cdr.markForCheck();
    });
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.selected.clear();
  }

  toggleSelect(id: number) {
    this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
    this.selected = new Set(this.selected); // referans değişimi için
  }

  toggleAll(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      this.paged.forEach(m => this.selected.add(m.id));
    } else {
      this.paged.forEach(m => this.selected.delete(m.id));
    }
    this.selected = new Set(this.selected);
  }

  markRead(msg: Message) {
    this.api.markMessageRead(msg.id).subscribe({
      next: () => { msg.isRead = true; this.cdr.markForCheck(); },
      error: () => this.toast.error('İşlem başarısız.')
    });
  }

  del(msg: Message) {
    this.toast.confirm(`"${msg.subject}" mesajı silinsin mi?`, () => {
      this.api.deleteMessage(msg.id).subscribe({
        next: () => { this.load(); this.toast.success('Mesaj silindi.'); },
        error: () => this.toast.error('Silme işlemi başarısız.')
      });
    }, 'Sil');
  }

  deleteSelected() {
    const ids = [...this.selected];
    this.toast.confirm(`${ids.length} mesaj silinsin mi?`, () => {
      forkJoin(ids.map(id => this.api.deleteMessage(id))).subscribe({
        next: () => { this.load(); this.toast.success(`${ids.length} mesaj silindi.`); },
        error: () => { this.load(); this.toast.error('Bazı mesajlar silinemedi.'); }
      });
    }, 'Sil');
  }
}
