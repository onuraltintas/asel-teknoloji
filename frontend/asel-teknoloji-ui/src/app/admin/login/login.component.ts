import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
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
