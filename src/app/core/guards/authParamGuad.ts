import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Company } from '@shared/interfaces/company/company';
import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthParamGuard implements CanActivate {
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const empresa = route.queryParams['empresa'];

    if (!empresa) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      const company = await this.companyService.getByField<Company>(
        'companies',
        'unique_url',
        empresa,
        'id'
      );
      if (company) {
        this.localStorageService.setItem('companyName', empresa);
        this.localStorageService.setItem('companyId', company.id);

        return true;
      } else {
        this.router.navigate(['/']);
        return false;
      }
    } catch (error) {
      console.error('Erro ao verificar empresa:', error);
      this.router.navigate(['/']);
      return false;
    }
  }
}
