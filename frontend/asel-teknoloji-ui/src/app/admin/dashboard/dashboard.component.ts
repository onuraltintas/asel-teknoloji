import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        @for (stat of stats; track stat.label) {
          <div class="card text-center">
            <div class="text-3xl mb-2">{{ stat.icon }}</div>
            <div class="text-2xl font-bold text-blue-700">{{ stat.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ stat.label }}</div>
          </div>
        }
      </div>
      <div class="card">
        <h3 class="font-semibold text-gray-700 mb-4">Bekleyen Teknik Servis Kayıtları</h3>
        @if (pendingServices.length === 0) {
          <p class="text-gray-400 text-sm">Bekleyen kayıt yok.</p>
        }
        @for (ts of pendingServices; track ts.id) {
          <div class="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <span class="font-medium text-sm">{{ ts.customerName }}</span>
              <span class="text-gray-400 text-xs ml-2">— {{ ts.deviceType }}</span>
            </div>
            <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{{ ts.serviceCode }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  stats = [
    { icon: '🔧', label: 'Hizmetler',    value: 0 },
    { icon: '📝', label: 'Blog Yazıları', value: 0 },
    { icon: '🛠️', label: 'Teknik Servis', value: 0 },
    { icon: '✉️', label: 'Mesajlar',     value: 0 },
  ];
  pendingServices: any[] = [];

  ngOnInit() {
    forkJoin({
      services:  this.api.getServicesAdmin().pipe(catchError(() => of([]))),
      blogs:     this.api.getBlogPostsAdmin().pipe(catchError(() => of([]))),
      technical: this.api.getTechnicalServices().pipe(catchError(() => of([]))),
      messages:  this.api.getMessages().pipe(catchError(() => of([])))
    }).subscribe({
      next: data => {
        this.stats[0].value = data.services.length;
        this.stats[1].value = data.blogs.length;
        this.stats[2].value = data.technical.length;
        this.stats[3].value = data.messages.length;
        this.pendingServices = data.technical.filter((t: any) => t.status === 0).slice(0, 5);
        this.cdr.markForCheck();
      },
      error: err => console.error('[Dashboard] forkJoin error:', err)
    });
  }
}
