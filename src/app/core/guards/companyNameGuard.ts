import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';

@Injectable({ providedIn: 'root' })
export class CompanyNameGuard implements CanActivate {
  private companyService = inject(CompanyService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const currentCompany = this.companyService.companyName();
    const routeCompany = route.params['companyName'];

    if (routeCompany !== currentCompany) {
      this.router.navigate(['/app', currentCompany]);
      return false;
    }

    return true;
  }
}
