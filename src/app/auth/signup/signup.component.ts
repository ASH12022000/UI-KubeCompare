import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, UserPlus, Mail, Lock, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-angular';
import { hashPassword } from '../../utils/hash.util';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  signupForm: FormGroup;
  otpForm:    FormGroup;
  isLoading = false;
  step: 'register' | 'otp' = 'register';

  readonly icons = { UserPlus, Mail, Lock, ShieldCheck, ArrowLeft, KeyRound };
  private readonly baseUrl = 'http://localhost:8080/api/auth';

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  async onSignup() {
    if (this.signupForm.invalid) return;
    this.isLoading = true;

    const hashedPwd = await hashPassword(this.signupForm.value.password);
    this.http.post(`${this.baseUrl}/signup`, {
      email: this.signupForm.value.email,
      password: hashedPwd
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('OTP sent to your email!');
        this.step = 'otp';
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.status === 409 ? 'This email is already registered. Please log in.' : 'Signup failed.';
        this.toastr.error(msg);
      }
    });
  }

  onVerifyOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading = true;

    const payload = {
      email: this.signupForm.value.email,
      otp:   this.otpForm.value.otp
    };

    this.http.post(`${this.baseUrl}/verify`, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Email verified! You can now sign in.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Invalid OTP. Please try again.');
      }
    });
  }

  resendOtp() {
    this.isLoading = true;
    this.http.post(`${this.baseUrl}/resend-otp`, { email: this.signupForm.value.email }).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('New OTP sent to your email!');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to resend OTP');
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}
