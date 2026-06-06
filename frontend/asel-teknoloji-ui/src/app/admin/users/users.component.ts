import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminUser } from '../../core/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h2>
        <button (click)="openForm()" class="btn-primary">+ Yeni Kullanıcı</button>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3">Kullanıcı Adı</th>
              <th class="text-left p-3">E-posta</th>
              <th class="text-left p-3">Rol</th>
              <th class="text-left p-3">Durum</th>
              <th class="text-left p-3">Oluşturulma</th>
              <th class="text-left p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items; track item.id) {
              <tr class="border-t hover:bg-gray-50">
                <td class="p-3 font-medium">
                  {{ item.username }}
                  @if (item.id === currentUserId) {
                    <span class="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Siz</span>
                  }
                </td>
                <td class="p-3 text-gray-600">{{ item.email }}</td>
                <td class="p-3">
                  @if (item.role === 'SuperAdmin') {
                    <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">Süper Admin</span>
                  } @else if (item.role === 'Admin') {
                    <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
                  } @else {
                    <span class="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold">Teknisyen</span>
                  }
                </td>
                <td class="p-3">
                  <span [class]="item.isActive ? 'text-green-600 font-medium' : 'text-red-500'">
                    {{ item.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="p-3 text-gray-400 text-xs">{{ item.createdAt | date:'dd.MM.yyyy' }}</td>
                <td class="p-3 flex gap-3">
                  <button (click)="openForm(item)" class="text-blue-600 hover:underline">Düzenle</button>
                  @if (item.id !== currentUserId) {
                    <button (click)="delete(item)" class="text-red-500 hover:underline">Sil</button>
                  }
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" class="p-6 text-center text-gray-400">Henüz kullanıcı eklenmemiş.</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (showForm) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 class="font-bold text-lg mb-4">{{ editing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı' }}</h3>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="space-y-3">
                <div>
                  <label class="label">Kullanıcı Adı *</label>
                  <input formControlName="username" class="input" placeholder="kullanici_adi" autocomplete="off" />
                  @if (form.get('username')?.invalid && form.get('username')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Kullanıcı adı zorunludur.</p>
                  }
                </div>
                <div>
                  <label class="label">E-posta *</label>
                  <input formControlName="email" type="email" class="input" placeholder="ornek@email.com" autocomplete="off" />
                  @if (form.get('email')?.invalid && form.get('email')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Geçerli bir e-posta giriniz.</p>
                  }
                </div>
                <div>
                  <label class="label">
                    Şifre {{ editing ? '(boş bırakılırsa değişmez)' : '*' }}
                  </label>
                  <input formControlName="password" type="password" class="input"
                         [placeholder]="editing ? 'Değiştirmek için yeni şifre girin' : 'En az 6 karakter'"
                         autocomplete="new-password" />
                  @if (form.get('password')?.invalid && form.get('password')?.touched) {
                    <p class="text-red-500 text-xs mt-1">Şifre en az 6 karakter olmalıdır.</p>
                  }
                </div>
                <div>
                  <label class="label">Rol *</label>
                  <select formControlName="role" class="input"
                          [disabled]="editing?.id === currentUserId">
                    <option value="Technician">Teknisyen (Sadece Teknik Servis)</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">Süper Admin</option>
                  </select>
                  @if (editing?.id === currentUserId) {
                    <p class="text-gray-400 text-xs mt-1">Kendi rolünüzü değiştiremezsiniz.</p>
                  }
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <input formControlName="isActive" type="checkbox" class="w-4 h-4" id="userActive"
                         [attr.disabled]="editing?.id === currentUserId ? true : null" />
                  <label for="userActive" class="text-sm cursor-pointer">Aktif</label>
                  @if (editing?.id === currentUserId) {
                    <span class="text-gray-400 text-xs">(Kendi hesabınızı devre dışı bırakamazsınız)</span>
                  }
                </div>
              </div>
              <div class="flex gap-3 mt-5">
                <button type="submit" [disabled]="form.invalid" class="btn-primary disabled:opacity-50">Kaydet</button>
                <button type="button" (click)="showForm = false" class="btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private api   = inject(ApiService);
  private auth  = inject(AuthService);
  private fb    = inject(FormBuilder);
  private cdr   = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  items: AdminUser[] = [];
  showForm = false;
  editing: AdminUser | null = null;
  currentUserId: string | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.minLength(6)],
    role:     ['Admin', Validators.required],
    isActive: [true]
  });

  ngOnInit() {
    this.currentUserId = this.getCurrentUserId();
    this.load();
  }

  load() {
    this.api.getUsers().subscribe(d => {
      this.items = d;
      this.cdr.markForCheck();
    });
  }

  openForm(item?: AdminUser) {
    this.editing = item ?? null;
    this.showForm = true;

    const passwordValidators = item ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)];
    this.form.get('password')!.setValidators(passwordValidators);
    this.form.get('password')!.updateValueAndValidity();

    this.form.patchValue({
      username: item?.username ?? '',
      email:    item?.email ?? '',
      password: '',
      role:     item?.role ?? 'Admin',
      isActive: item?.isActive ?? true
    });
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.value;

    if (this.editing) {
      const dto: any = { username: v.username, email: v.email, role: v.role, isActive: v.isActive };
      if (v.password) dto.password = v.password;
      this.api.updateUser(this.editing.id, dto).subscribe({
        next: () => { this.showForm = false; this.load(); this.toast.success('Kullanıcı güncellendi.'); },
        error: err => this.toast.error(err?.error?.message ?? 'Güncelleme başarısız.')
      });
    } else {
      this.api.createUser({ username: v.username!, email: v.email!, password: v.password!, role: v.role!, isActive: v.isActive! }).subscribe({
        next: () => { this.showForm = false; this.load(); this.toast.success('Kullanıcı oluşturuldu.'); },
        error: err => this.toast.error(err?.error?.message ?? 'Kayıt başarısız.')
      });
    }
  }

  delete(item: AdminUser) {
    this.toast.confirm(`"${item.username}" kullanıcısı silinsin mi?`, () => {
      this.api.deleteUser(item.id).subscribe({
        next: () => { this.load(); this.toast.success('Kullanıcı silindi.'); },
        error: err => this.toast.error(err?.error?.message ?? 'Silme başarısız.')
      });
    }, 'Sil');
  }

  private getCurrentUserId(): string | null {
    const token = this.auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? null;
    } catch { return null; }
  }
}
