import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

export const isLoggedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogged()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
