import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    const { data } = await this.authService.supabase.auth.getSession();

    if (!data.session) {
      this.router.navigate(['/auth']);
      return false;
    }

    return true;
  }
}
