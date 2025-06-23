import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private companyService = inject(CompanyService);

 canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    this.router.navigate(['/auth', this.companyService.companyName()]);
    return false;
  }
}
