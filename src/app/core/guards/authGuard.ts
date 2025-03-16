import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  async canActivate(): Promise<boolean> {
    try {
      const { data, error } = await this.authService.supabaseService.supabase.auth.getSession();

      if (error) {
        console.error('Erro ao obter a sessão', error);
        return true;
      }

      const isAuthenticated = !!data.session;

      if (isAuthenticated && this.router.url === '/auth') {
        this.router.navigate(['/app']);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro na verificação da autenticação', err);
      return true;
    }
  }
}
