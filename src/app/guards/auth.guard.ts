import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';
import { ApiService } from '../services/api.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthStorageService);
  const api    = inject(ApiService);
  const router = inject(Router);

  if (!auth.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Verify token with backend
  return api.validateToken().pipe(
    map(() => true),
    catchError(() => {
      auth.clear(); // Log out locally
      router.navigate(['/login']);
      return of(false);
    })
  );
};
