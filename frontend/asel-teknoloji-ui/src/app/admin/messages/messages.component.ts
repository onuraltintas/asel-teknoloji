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
  templateUrl: './messages.component.html'
})
export class MessagesComponent implements OnInit {
  private api   = inject(ApiService);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  messages: Message[] = [];
  selected     = new Set<number>();
  page         = 1;
  pageSize     = PAGE_SIZE;
  pageSizeOptions = [5, 10, 25, 50, 100];

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

  changePageSize(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.page = 1;
    this.selected = new Set();
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
