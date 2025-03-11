import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const AuthAccessGuard : CanActivateFn = (route, state) => {
  const referrer = document.referrer;
  const router = inject(Router);

  if (!referrer) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
}
