import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '../services/auth-storage.service';

/** Prevents authenticated users from accessing login/signup pages */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthStorageService);
  const router = inject(Router);

  if (auth.getToken()) {
    router.navigate(['/wizard']);
    return false;
  }
  return true;
};
