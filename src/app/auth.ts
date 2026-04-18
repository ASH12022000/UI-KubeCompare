import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userToken = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  token$ = this.userToken.asObservable();

  constructor(private http: HttpClient) {}

  signup(email: string, password: string) {
    return this.http.post('/api/auth/signup', { email, password });
  }

  verify(email: string, otp: string) {
    return this.http.post('/api/auth/verify', { email, otp });
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this.userToken.next(res.token);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.userToken.next(null);
  }

  isLoggedIn() {
    return !!this.userToken.value;
  }
}
<!-- slide -->
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen flex items-center justify-center bg-dark">
      <div class="glass p-8 w-96">
        <h2 class="text-2xl font-bold mb-6 text-center">Login to K8s Comparator</h2>
        <input type="email" [(ngModel)]="email" placeholder="Email" class="input-field">
        <input type="password" [(ngModel)]="password" placeholder="Password" class="input-field">
        <button (click)="onLogin()" class="btn-primary w-full">Sign In</button>
        <p class="mt-4 text-center text-muted text-sm">
          No account? <a (click)="goToSignup()" class="text-primary cursor-pointer">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert('Login failed: ' + (err.error.error || 'Unknown error'))
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
