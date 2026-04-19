import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthStorageService } from '../services/auth-storage.service';
import { ToastrService } from 'ngx-toastr';
import { LucideAngularModule, User, Shield, AlertTriangle, Info, Bug, Save, Send, Trash2, KeyRound } from 'lucide-angular';
import { hashPassword } from '../utils/hash.util';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';
  isLoading = false;

  profileForm: FormGroup;
  passwordForm: FormGroup;
  deleteForm: FormGroup;
  bugForm: FormGroup;

  isPasswordOtpStep = false;
  profileEmail = '';

  readonly icons = { User, Shield, AlertTriangle, Info, Bug, Save, Send, Trash2, KeyRound };

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private authStorage: AuthStorageService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      displayName: [''],
      organization: ['']
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required],
      otp: ['']
    }, { validator: this.passwordMatchValidator });

    this.deleteForm = this.fb.group({
      confirmEmail: ['', Validators.required]
    });

    this.bugForm = this.fb.group({
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { 'mismatch': true };
  }

  loadProfile() {
    this.api.getProfile().subscribe({
      next: (res) => {
        this.profileEmail = res.email;
        this.profileForm.patchValue({
          displayName: res.displayName,
          organization: res.organization
        });
      },
      error: () => this.toastr.error('Failed to load profile')
    });
  }

  onSaveProfile() {
    this.isLoading = true;
    this.api.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Profile updated');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to update profile');
      }
    });
  }

  async onSendPasswordOtp() {
    if (this.passwordForm.get('oldPassword')?.invalid || this.passwordForm.get('newPassword')?.invalid || this.passwordForm.hasError('mismatch')) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.api.sendChangePasswordOtp().subscribe({
      next: () => {
        this.isLoading = false;
        this.isPasswordOtpStep = true;
        this.passwordForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
        this.passwordForm.get('otp')?.updateValueAndValidity();
        this.toastr.success('OTP sent to your email');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to send OTP');
      }
    });
  }

  async onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.isLoading = true;

    const oldHash = await hashPassword(this.passwordForm.value.oldPassword);
    const newHash = await hashPassword(this.passwordForm.value.newPassword);

    const payload = {
      oldPassword: oldHash,
      newPassword: newHash,
      otp: this.passwordForm.value.otp
    };

    this.api.changePassword(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Password changed successfully. Please log in again.');
        this.onLogout();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Invalid OTP or old password');
      }
    });
  }

  onDeleteAccount() {
    if (this.deleteForm.invalid || this.deleteForm.value.confirmEmail !== this.profileEmail) {
      this.toastr.error('Email does not match');
      return;
    }

    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    this.isLoading = true;
    this.api.deleteAccount(this.deleteForm.value.confirmEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Account deleted successfully');
        this.onLogout();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to delete account');
      }
    });
  }

  onReportBug() {
    if (this.bugForm.invalid) return;
    this.isLoading = true;
    
    this.api.reportBug(this.bugForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.bugForm.reset();
        this.toastr.success('Bug report sent successfully. Thank you!');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to send bug report');
      }
    });
  }

  onLogout() {
    this.authStorage.clear();
    this.router.navigate(['/login']);
  }
}
