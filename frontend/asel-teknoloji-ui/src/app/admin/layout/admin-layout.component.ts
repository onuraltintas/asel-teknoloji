import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  template: `
    <div class="flex h-screen bg-gray-100">
      <aside class="w-64 bg-blue-900 text-white flex flex-col">
        <div class="p-6 border-b border-blue-800">
          <h1 class="font-bold text-lg">Asel Teknoloji</h1>
          <p class="text-blue-300 text-sm mt-1">{{ auth.getUsername() }}</p>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          @for (item of visibleMenuItems; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="bg-blue-700"
               class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 transition text-sm">
              <span>{{ item.icon }}</span><span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="p-4 border-t border-blue-800">
          <button (click)="auth.logout()" class="w-full text-left text-sm text-blue-300 hover:text-white px-3 py-2">
            🚪 Çıkış Yap
          </button>
        </div>
      </aside>
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-white shadow-sm px-6 py-4">
          <h2 class="text-gray-700 font-semibold">Admin Panel</h2>
        </header>
        <main class="flex-1 overflow-y-auto p-6"><router-outlet /></main>
      </div>
    </div>
    <app-toast />
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);

  private allMenuItems = [
    { path: '/admin/dashboard',    icon: '📊', label: 'Dashboard',       roles: ['SuperAdmin', 'Admin', 'Technician'] },
    { path: '/admin/sliders',      icon: '🖼️', label: 'Sliderlar',       roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/categories',   icon: '📁', label: 'Kategoriler',     roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/services',     icon: '🔧', label: 'Hizmetler',       roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/technical',    icon: '🛠️', label: 'Teknik Servis',   roles: ['SuperAdmin', 'Admin', 'Technician'] },
    { path: '/admin/blogs',        icon: '📝', label: 'Blog Yazıları',   roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/references',   icon: '🏢', label: 'Referanslar',     roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/features',     icon: '⭐', label: 'Özellikler',      roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/page-content', icon: '📄', label: 'Vizyon & Misyon', roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/messages',     icon: '✉️', label: 'Mesajlar',        roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/settings',     icon: '⚙️', label: 'Site Ayarları',   roles: ['SuperAdmin', 'Admin'] },
    { path: '/admin/users',        icon: '👥', label: 'Kullanıcılar',    roles: ['SuperAdmin'] },
  ];

  get visibleMenuItems() {
    const role = this.auth.getRole() ?? '';
    return this.allMenuItems.filter(item => item.roles.includes(role));
  }
}
