import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
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
