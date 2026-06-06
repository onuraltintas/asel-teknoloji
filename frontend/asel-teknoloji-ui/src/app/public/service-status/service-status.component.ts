import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { JsonLdService } from '../../core/services/json-ld.service';

interface StatusResult {
  serviceCode: string;
  status: number;
  statusLabel: string;
  deviceType: string;
  adminNote?: string;
  createdAt: string;
}

@Component({
  selector: 'app-service-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-status.component.html'
})
export class ServiceStatusComponent implements OnInit {
  private api      = inject(ApiService);
  private titleSvc = inject(Title);
  private metaSvc  = inject(Meta);
  private jsonLd   = inject(JsonLdService);

  activeTab = signal<'create' | 'track'>('create');

  // ── Servis kaydı oluştur ──────────────────────────────────────
  createForm = { customerName: '', customerPhone: '', customerEmail: '', deviceType: '', issueDescription: '' };
  creating    = signal(false);
  createdCode = signal('');
  createError = signal('');

  submitCreate(form: any) {
    if (!this.createForm.customerName || !this.createForm.customerPhone ||
        !this.createForm.deviceType   || !this.createForm.issueDescription) return;
    this.creating.set(true);
    this.createError.set('');
    this.api.createTechnicalService(this.createForm).subscribe({
      next:  r  => { this.createdCode.set(r.serviceCode); this.creating.set(false); },
      error: () => { this.createError.set('Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'); this.creating.set(false); }
    });
  }

  resetCreate() {
    this.createdCode.set('');
    this.createError.set('');
    this.createForm = { customerName: '', customerPhone: '', customerEmail: '', deviceType: '', issueDescription: '' };
  }

  goTrack() {
    this.code = this.createdCode();
    this.activeTab.set('track');
    this.search();
  }

  // ── Servis takip ─────────────────────────────────────────────
  code      = '';
  result    = signal<StatusResult | null>(null);
  searching = signal(false);
  errorMsg  = signal('');

  setTab(tab: 'create' | 'track') {
    this.activeTab.set(tab);
  }

  search() {
    const trimmed = this.code.trim().toUpperCase();
    if (!trimmed) return;
    this.searching.set(true);
    this.errorMsg.set('');
    this.result.set(null);
    this.api.queryServiceStatus(trimmed).subscribe({
      next:  r  => { this.result.set(r); this.searching.set(false); },
      error: () => { this.errorMsg.set(`"${trimmed}" koduna ait servis kaydı bulunamadı.`); this.searching.set(false); }
    });
  }

  resetTrack() { this.result.set(null); this.errorMsg.set(''); this.code = ''; }

  // ── Meta ─────────────────────────────────────────────────────
  ngOnInit() {
    this.titleSvc.setTitle('Teknik Servis | Asel Teknoloji');
    this.metaSvc.updateTag({ name: 'description',  content: 'Teknik servis kaydı oluşturun veya servis takip kodunuzla cihazınızın anlık durumunu sorgulayın.' });
    this.metaSvc.updateTag({ property: 'og:title', content: 'Teknik Servis | Asel Teknoloji' });
    this.metaSvc.updateTag({ property: 'og:type',  content: 'website' });
    this.jsonLd.set({
      '@context': 'https://schema.org', '@type': 'WebPage',
      'name': 'Teknik Servis | Asel Teknoloji',
      'description': 'Teknik servis kaydı oluşturun veya servis takip kodunuzla cihazınızın anlık durumunu sorgulayın.',
      'url': 'https://aselteknoloji.com/servis-takip',
      'publisher': { '@type': 'Organization', 'name': 'Asel Teknoloji', 'url': 'https://aselteknoloji.com' }
    });
  }

  // ── Stepper ──────────────────────────────────────────────────
  steps = [
    { status: 0, label: 'Kayıt Alındı',        desc: 'Arıza kaydınız sisteme alındı.' },
    { status: 1, label: 'İnceleme Aşamasında',  desc: 'Teknisyenlerimiz cihazınızı inceliyor.' },
    { status: 2, label: 'Parça Bekleniyor',      desc: 'Gerekli parçalar temin ediliyor.' },
    { status: 3, label: 'Tamamlandı',            desc: 'Cihazınız hazır, teslim alabilirsiniz.' },
    { status: 4, label: 'İptal Edildi',          desc: 'Servis kaydı iptal edildi.' },
  ];

  isActive(s: number, status: number)    { return status === s && s !== 4; }
  isCompleted(s: number, status: number) { return status !== 4 && s < status && s !== 4; }
  isPending(s: number, status: number)   { return !this.isActive(s, status) && !this.isCompleted(s, status); }

  stepClass(s: number, status: number) {
    if (status === 4 && s === 4) return 'bg-red-100 text-red-600 border-2 border-red-400';
    if (this.isCompleted(s, status)) return 'bg-green-500 text-white';
    if (this.isActive(s, status))    return 'bg-blue-600 text-white ring-4 ring-blue-100';
    return 'bg-gray-100 text-gray-400 border border-gray-200';
  }

  statusClass(s: number) {
    const m: Record<number,string> = {
      0: 'bg-yellow-100 text-yellow-700', 1: 'bg-blue-100 text-blue-700',
      2: 'bg-orange-100 text-orange-700', 3: 'bg-green-100 text-green-700',
      4: 'bg-red-100 text-red-600'
    };
    return m[s] ?? 'bg-gray-100 text-gray-600';
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
