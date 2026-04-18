import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {

  getUserId(): string {
    return localStorage.getItem('userId') ?? 'anonymous';
  }

  setUserId(userId: string) {
    localStorage.setItem('userId', userId);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  clear() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }
}
