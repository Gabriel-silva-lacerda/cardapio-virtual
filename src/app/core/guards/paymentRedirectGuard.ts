import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminRedirectGuard implements CanActivate {
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  async canActivate(): Promise<boolean | UrlTree> {
    const isAdmin = this.authService.isAdmin();
    const adminMode = this.authService.adminMode();
    const companyName = this.companyService.companyName();
    if (isAdmin && adminMode) {
      return this.router.createUrlTree(['/app/admin', companyName]);
    }

    return true;
  }
}
