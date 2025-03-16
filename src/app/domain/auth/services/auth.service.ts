import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iUser } from '../interfaces/user.interface';
import { BaseService } from '@shared/services/base/base.service';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseSupabaseService {
  // public supabase = injectSupabase();
  private router = inject(Router);

  public currentUser = signal<iUser | null>(null);
  public isLogged = signal<boolean>(false);
  private publicRoutes = ['/planos', '/outra-rota-publica'];

  public async load() {
    const { data } = await this.supabaseService.supabase.auth.getSession();

    if (!data.session) {
      // await this.purgeAndRedirect();
      return;
    }

    // this.currentUser.set(data.session.user as unknown as iUser);

    this.getUser(data.session.user.id)
    this.isLogged.set(true);
  }

  public async purgeAndRedirect() {
    const currentUrl = this.router.url;
    console.log(this.router.url);

    if (this.publicRoutes.includes(currentUrl)) {
      return;
    }
    await this.supabaseService.supabase.auth.signOut();
    // this.router.navigate(['/auth']);
  }

  public async getUser(userId: string) {
    const user = await this.getById<iUser>('users', userId);
    this.currentUser.set(user);
  }
}
