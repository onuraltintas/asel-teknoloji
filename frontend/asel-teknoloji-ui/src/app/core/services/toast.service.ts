import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export interface ConfirmDialog {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts        = signal<Toast[]>([]);
  confirmDialog = signal<ConfirmDialog | null>(null);

  success(message: string, duration = 4000) { this.add('success', message, duration); }
  error(message: string,   duration = 5000) { this.add('error',   message, duration); }
  warning(message: string, duration = 4000) { this.add('warning', message, duration); }
  info(message: string,    duration = 4000) { this.add('info',    message, duration); }

  private add(type: ToastType, message: string, duration: number) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  confirm(message: string, onConfirm: () => void, confirmLabel = 'Evet') {
    this.confirmDialog.set({ message, confirmLabel, onConfirm });
  }

  confirmYes() {
    const d = this.confirmDialog();
    if (d) { d.onConfirm(); this.confirmDialog.set(null); }
  }

  confirmNo() {
    this.confirmDialog.set(null);
  }
}
