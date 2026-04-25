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

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string) {
    sessionStorage.setItem('refreshToken', token);
  }

  getExpiresAt(): number | null {
    const val = sessionStorage.getItem('expiresAt');
    return val ? parseInt(val, 10) : null;
  }

  setExpiresAt(expiresAt: number) {
    sessionStorage.setItem('expiresAt', expiresAt.toString());
  }

  clear() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('expiresAt');
  }
}
