import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Asel Teknoloji</h1>
          <p class="text-gray-500 mt-1">Admin Paneli</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="label">Kullanıcı Adı</label>
            <input formControlName="username" type="text" class="input" placeholder="Kullanıcı adı" autocomplete="username" />
          </div>
          <div class="mb-4">
            <label class="label">Şifre</label>
            <input formControlName="password" type="password" class="input" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="mb-6 flex items-center gap-2">
            <input formControlName="rememberMe" id="rememberMe" type="checkbox" class="w-4 h-4 accent-blue-600 cursor-pointer" />
            <label for="rememberMe" class="text-sm text-gray-600 cursor-pointer select-none">Beni hatırla</label>
          </div>
          @if (error) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{{ error }}</div>
          }
          <button type="submit" [disabled]="loading" class="btn-primary w-full text-center">
            {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  form = this.fb.group({
    username:   ['', Validators.required],
    password:   ['', Validators.required],
    rememberMe: [false]
  });
  loading = false;
  error   = '';

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { username, password, rememberMe } = this.form.value;
    this.auth.login({ username: username!, password: password! }, rememberMe ?? false).subscribe({
      next:  () => this.router.navigate(['/admin/dashboard']),
      error: () => { this.error = 'Kullanıcı adı veya şifre hatalı.'; this.loading = false; this.cdr.markForCheck(); }
    });
  }
}
