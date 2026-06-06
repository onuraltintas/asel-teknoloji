import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  svc = inject(ToastService);

  cls(type: string) {
    return {
      success: 'bg-green-600 text-white',
      error:   'bg-red-600 text-white',
      warning: 'bg-orange-500 text-white',
      info:    'bg-blue-600 text-white',
    }[type] ?? '';
  }

  icon(type: string) {
    return { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type] ?? '';
  }
}
