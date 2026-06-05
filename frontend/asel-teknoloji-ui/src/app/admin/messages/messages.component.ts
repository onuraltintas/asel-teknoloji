import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Message } from '../../core/models/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Mesajlar
        @if (unread > 0) { <span class="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">{{ unread }}</span> }
      </h2>
      <div class="space-y-3">
        @for (msg of messages; track msg.id) {
          <div class="card" [class.border-l-4]="!msg.isRead" [class.border-blue-500]="!msg.isRead">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  @if (!msg.isRead) { <span class="w-2 h-2 bg-blue-500 rounded-full inline-block"></span> }
                  <span class="font-semibold text-gray-800">{{ msg.fullName }}</span>
                  <span class="text-gray-400 text-sm">{{ msg.email }}</span>
                  @if (msg.phone) { <span class="text-gray-400 text-sm">· {{ msg.phone }}</span> }
                </div>
                <div class="font-medium text-gray-700 mt-1">{{ msg.subject }}</div>
                <div class="text-gray-600 text-sm mt-1">{{ msg.body }}</div>
                <div class="text-gray-400 text-xs mt-2">{{ msg.createdAt | date:'dd.MM.yyyy HH:mm' }}</div>
              </div>
              <div class="flex gap-2 ml-4 shrink-0">
                @if (!msg.isRead) { <button (click)="markRead(msg)" class="text-xs text-blue-600 hover:underline">Okundu</button> }
                <button (click)="del(msg)" class="text-xs text-red-500 hover:underline">Sil</button>
              </div>
            </div>
          </div>
        }
        @if (messages.length === 0) { <div class="card text-center text-gray-400">Henüz mesaj yok.</div> }
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  messages: Message[] = [];
  get unread() { return this.messages.filter(m => !m.isRead).length; }
  ngOnInit() { this.load(); }
  load() { this.api.getMessages().subscribe(d => { this.messages = d; this.cdr.markForCheck(); }); }
  markRead(msg: Message) { this.api.markMessageRead(msg.id).subscribe(() => { msg.isRead = true; this.cdr.markForCheck(); }); }
  del(msg: Message) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    this.api.deleteMessage(msg.id).subscribe(() => this.load());
  }
}
