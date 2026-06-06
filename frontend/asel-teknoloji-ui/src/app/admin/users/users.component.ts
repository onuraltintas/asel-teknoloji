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
  templateUrl: './users.component.html'
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
