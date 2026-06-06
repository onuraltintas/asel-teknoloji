import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);

  form    = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  loading = false;
  sent    = false;
  error   = '';

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.form.value).subscribe({
      next:  () => { this.sent = true; this.loading = false; },
      error: () => { this.error = 'İşlem başarısız. Lütfen tekrar deneyin.'; this.loading = false; }
    });
  }
}
