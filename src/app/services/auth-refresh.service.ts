import { Injectable, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { AuthStorageService } from './auth-storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthRefreshService implements OnDestroy {
  private refreshTimeout: any;

  constructor(
    private api: ApiService,
    private authStorage: AuthStorageService,
    private router: Router
  ) {
    this.startRefreshTimer();
  }

  public startRefreshTimer() {
    this.stopRefreshTimer();

    const token = this.authStorage.getToken();
    const expiresAt = this.authStorage.getExpiresAt();
    
    if (!token || !expiresAt) {
      return;
    }

    // Calculate time to refresh: at least 30 seconds before expiry
    const timeToExpiry = expiresAt - Date.now();
    const timeToRefresh = timeToExpiry - 30000;

    if (timeToRefresh > 0) {
      // Schedule refresh
      this.refreshTimeout = setTimeout(() => this.refreshToken(), timeToRefresh);
    } else if (timeToExpiry > 0) {
      // Less than 30 seconds to expiry, refresh immediately
      this.refreshToken();
    } else {
      // Token already expired
      this.logout();
    }
  }

  public stopRefreshTimer() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private   refreshToken() {
    const refreshToken = this.authStorage.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return;
    }

    this.api.refreshToken(refreshToken).subscribe({
      next: (res: { token: string; refreshToken: string; expiresIn: number }) => {
        this.authStorage.setToken(res.token);
        if (res.refreshToken) {
          this.authStorage.setRefreshToken(res.refreshToken);
        }
        if (res.expiresIn) {
          const expiresAt = Date.now() + res.expiresIn;
          this.authStorage.setExpiresAt(expiresAt);
        }
        this.startRefreshTimer();
      },
      error: () => {
        this.logout();
      }
    });
  }

  private logout() {
    this.stopRefreshTimer();
    this.authStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.stopRefreshTimer();
  }
}
