import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastComponent } from '../../shared/toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './admin-layout.component.html'
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
