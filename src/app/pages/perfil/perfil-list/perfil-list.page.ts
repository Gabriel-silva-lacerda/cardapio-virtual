import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { SupabaseService } from '@shared/services/supabase/supabase.service';

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
  private companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  // constructor() {
  //   this.checkAuthState(); // Verifica o estado de autenticação ao carregar a página
  // }

  // // Verifica se o usuário está autenticado
  // private async checkAuthState() {
  //   const { data: { user }, error } = await this.supabase.auth.getUser();

  //   if (error) {
  //     console.error('Erro ao verificar autenticação:', error.message);
  //     this.redirectToPlans(); // Redireciona para /plans se não estiver autenticado
  //     return;
  //   }

  //   if (!user) {
  //     this.redirectToPlans(); // Redireciona para /plans se não estiver autenticado
  //   }
  // }

  // // Redireciona para a página de planos
  // private redirectToPlans() {
  //   this.router.navigate(['/plans']);
  // }

  // Realiza o logout
  async logout() {
    try {
      // Verifica se o usuário está autenticado antes de fazer logout
      // const { data: { user }, error: authError } = await this.supabase.auth.getUser();

      // if (authError || !user) {
      //   console.error('Usuário não autenticado:', authError?.message || 'Nenhum usuário logado');
      //   this.redirectToPlans(); // Redireciona para /plans se não estiver autenticado
      //   return;
      // }

      // Faz o logout
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error.message);
        return;
      }

      // Remove o nome da empresa do localStorage
      // this.localStorageService.removeItem('companyName');

      // Redireciona para a página de auth com o query param
      this.router.navigate(['/auth'], {
        queryParams: { empresa: this.companyName() }
      });
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
    }
  }
}
