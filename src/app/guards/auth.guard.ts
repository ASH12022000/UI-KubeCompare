import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthStorageService);
  const router = inject(Router);

  if (auth.getToken()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
