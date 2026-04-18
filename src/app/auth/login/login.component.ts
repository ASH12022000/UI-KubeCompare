import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthStorageService } from '../../services/auth-storage.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, LogIn, Mail, Lock, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  // OTP step is only shown during signup verification, not login
  isOtpStep  = false;
  isLoading  = false;

  readonly icons = { LogIn, Mail, Lock, ShieldCheck };

  constructor(
    private fb:          FormBuilder,
    private api:         ApiService,
    private authStorage: AuthStorageService,
    private router:      Router,
    private toastr:      ToastrService
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  goToSignup()        { this.router.navigate(['/signup']); }
  goToForgotPassword() { this.router.navigate(['/forgot-password']); }

  onLogin() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading = true;

    this.api.login(this.loginForm.value).subscribe({
      next: (res: { token: string; userId: string; email: string }) => {
        this.authStorage.setToken(res.token);
        this.authStorage.setUserId(res.userId ?? res.email);
        this.isLoading = false;
        this.toastr.success('Welcome back!');
        this.router.navigate(['/wizard']);
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Invalid credentials or account not verified');
      }
    });
  }

  /** Used by the signup OTP verification flow (separate from login) */
  onVerifyOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading = true;

    const data = { email: this.loginForm.value.email, otp: this.otpForm.value.otp };
    this.api.verifyOtp(data).subscribe({
      next: () => {
        this.isLoading  = false;
        this.isOtpStep  = false;
        this.toastr.success('Email verified! You can now log in.');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Invalid OTP');
      }
    });
  }
}
