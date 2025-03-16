import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.scss',
  animations: [fade]
})
export class PerfilPage {
  private supabase = injectSupabase();
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);
  private companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  public isLogged = this.authService.isLogged;
  public currentUser = this.authService.currentUser;
  public userInitialSignal = signal<string>('');

  async ngOnInit() {
    this.updateUserInitial();
  }

  async logout() {
    if (this.isLogged()) {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return;
      }

      this.authService.isLogged.set(false);
    }

    this.router.navigate(['/auth'], {
      queryParams: { empresa: this.companyName() },
    });
  }

  private updateUserInitial() {
    const fullName = this.currentUser()?.full_name || '';
    const initial = fullName.charAt(0).toUpperCase();
    this.userInitialSignal.set(initial);
  }
}
