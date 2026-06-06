import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private http  = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token   = '';
  loading = false;
  done    = false;
  error   = '';

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatch });

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.error = 'Geçersiz sıfırlama bağlantısı.';
  }

  submit() {
    if (this.form.invalid || !this.token) return;
    this.loading = true; this.error = '';
    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.form.value.newPassword
    }).subscribe({
      next:  () => { this.done = true; this.loading = false; setTimeout(() => this.router.navigate(['/admin/login']), 3000); },
      error: (err) => { this.error = err?.error?.error ?? 'Şifre sıfırlanamadı. Bağlantının süresi dolmuş olabilir.'; this.loading = false; }
    });
  }

  private passwordMatch(group: any) {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  }
}
