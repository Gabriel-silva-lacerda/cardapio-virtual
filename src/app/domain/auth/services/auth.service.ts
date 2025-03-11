import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = injectSupabase();
  private router = inject(Router);

  public currentUser = signal<iUser | null>(null);
  public isLogged = signal<boolean>(false);

  public async load() {
    const { data } = await this.supabase.auth.getSession();
    if (!data.session) {
      await this.purgeAndRedirect();
      return;
    }

    this.currentUser.set(data.session.user as unknown as iUser);
    this.isLogged.set(true);
    console.log('User loaded:', this.currentUser());
  }

  public async purgeAndRedirect() {
    await this.supabase.auth.signOut();
    // this.router.navigate(['/auth']);
  }
}
