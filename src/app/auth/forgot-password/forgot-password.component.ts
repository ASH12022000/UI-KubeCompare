import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, Mail, Lock, ArrowLeft, KeyRound } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  step: 'request' | 'reset' = 'request';
  isLoading = false;

  requestForm: FormGroup;
  resetForm:   FormGroup;

  readonly icons = { Mail, Lock, ArrowLeft, KeyRound };
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      email:       ['', [Validators.required, Validators.email]],
      token:       ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRequestReset() {
    if (this.requestForm.invalid) { this.requestForm.markAllAsTouched(); return; }
    this.isLoading = true;

    this.http.post(`${this.baseUrl}/forgot-password`, this.requestForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('If the email is registered, a reset token has been sent.');
        // Pre-fill email in reset form
        this.resetForm.patchValue({ email: this.requestForm.value.email });
        this.step = 'reset';
      },
      error: () => { this.isLoading = false; this.toastr.error('Request failed'); }
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    this.isLoading = true;

    this.http.post(`${this.baseUrl}/reset-password`, this.resetForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Password reset! Please log in.');
        this.router.navigate(['/login']);
      },
      error: () => { this.isLoading = false; this.toastr.error('Invalid or expired token.'); }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}
