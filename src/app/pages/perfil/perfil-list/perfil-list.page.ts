import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil-list.page.html',
  styleUrl: './perfil-list.page.scss',
})
export class PerfilListPage {
  private supabase = injectSupabase();
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);
  private companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error.message);
        return;
      }

      this.authService.isLogged.set(false);

      this.router.navigate(['/auth'], {
        queryParams: { empresa: this.companyName() },
      });
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
    }
  }
}
