import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Company } from "@shared/interfaces/company";
import { CompanyService } from "@shared/services/company/company.service";

@Injectable({
  providedIn: 'root',
})
export class AuthParamGuard implements CanActivate {
  private companyService = inject(CompanyService);
  constructor(private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const empresa = route.queryParams['empresa'];

    if (!empresa) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      // Verifica se a empresa existe no Supabase pela unique_url
      const company = await this.companyService.getByField<Company>('companies', 'unique_url', empresa, 'id');
      if (company) {
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
