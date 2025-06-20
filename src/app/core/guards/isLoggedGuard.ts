import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

export const IsLoggedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const companyName = localStorageService.getSignal<string>('companyName', '[]');

  if (authService.isLogged()) {
    router.navigate(['/app', companyName()]);
    return false;
  }

  return true;
};
