import { Routes } from '@angular/router';
import { authGuard, authGuardChild } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./public/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent) },
      { path: 'hizmet/:slug', loadComponent: () => import('./public/service-detail/service-detail.component').then(m => m.ServiceDetailComponent) },
      { path: 'servis-takip', loadComponent: () => import('./public/service-status/service-status.component').then(m => m.ServiceStatusComponent) },
      { path: 'iletisim', loadComponent: () => import('./public/contact/contact.component').then(m => m.ContactComponent) },
      { path: 'blog', loadComponent: () => import('./public/blog-list/blog-list.component').then(m => m.BlogListComponent) },
      { path: 'blog/:slug', loadComponent: () => import('./public/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },
      { path: 'referanslar', loadComponent: () => import('./public/references/references.component').then(m => m.ReferencesComponent) },
      { path: 'vizyon',     loadComponent: () => import('./public/vision/vision.component').then(m => m.VisionComponent) },
      { path: 'misyon',     loadComponent: () => import('./public/mission/mission.component').then(m => m.MissionComponent) },
    ]
  },

  { path: 'admin/login', loadComponent: () => import('./admin/login/login.component').then(m => m.LoginComponent) },

  {
    path: 'admin',
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'sliders',      loadComponent: () => import('./admin/sliders/sliders.component').then(m => m.SlidersComponent),         data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'categories',   loadComponent: () => import('./admin/categories/categories.component').then(m => m.CategoriesComponent), data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'services',     loadComponent: () => import('./admin/services/services.component').then(m => m.ServicesComponent),       data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'technical',    loadComponent: () => import('./admin/technical/technical.component').then(m => m.TechnicalComponent) },
      { path: 'blogs',        loadComponent: () => import('./admin/blogs/blogs.component').then(m => m.BlogsComponent),               data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'references',   loadComponent: () => import('./admin/references/references.component').then(m => m.ReferencesComponent), data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'features',     loadComponent: () => import('./admin/features/features.component').then(m => m.FeaturesComponent),       data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'page-content', loadComponent: () => import('./admin/page-content/page-content.component').then(m => m.PageContentComponent), data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'messages',     loadComponent: () => import('./admin/messages/messages.component').then(m => m.MessagesComponent),       data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'settings',     loadComponent: () => import('./admin/settings/settings.component').then(m => m.SettingsComponent),       data: { roles: ['SuperAdmin', 'Admin'] } },
      { path: 'users',        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),               data: { roles: ['SuperAdmin'] } },
    ]
  },

  { path: '**', redirectTo: '' }
];
