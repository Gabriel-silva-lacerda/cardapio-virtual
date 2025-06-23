import { inject, Injectable } from "@angular/core";
import { CanActivate, CanActivateFn, Router, UrlTree } from "@angular/router";
import { CompanyService } from "@shared/services/company/company.service";
import { AuthService } from "src/app/domain/auth/services/auth.service";

@Injectable({ providedIn: 'root' })
export class IsAuthenticatedGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private companyService = inject(CompanyService);

  canActivate(): boolean | UrlTree {
    if (!this.authService.isLogged()) {
      return this.router.createUrlTree(['/auth', this.companyService.companyName()]);
    }
    return true;
  }
}
