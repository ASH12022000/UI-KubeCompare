import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {

  getUserId(): string {
    return sessionStorage.getItem('userId') ?? 'anonymous';
  }

  setUserId(userId: string) {
    sessionStorage.setItem('userId', userId);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  setToken(token: string) {
    sessionStorage.setItem('token', token);
  }

  clear() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
  }
}
