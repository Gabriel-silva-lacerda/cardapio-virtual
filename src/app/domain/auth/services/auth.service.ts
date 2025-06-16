import {inject, Injectable, signal } from '@angular/core';
import { iUser } from '../interfaces/user.interface';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { Router } from '@angular/router';
import { Company } from '@shared/interfaces/company/company';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseSupabaseService {
  private localStorageService = inject(LocalStorageService);
  private router = inject(Router);
   private companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );
  public currentUser = signal<iUser | null>(null);
  public isLogged = signal<boolean>(false);
  public isAdmin = signal<boolean>(false);
  public adminMode = signal<boolean>(false);

  public async load() {
    const { data, error } = await this.supabaseService.supabase.auth.getSession();
    if (!data.session || error) {
      return;
    }

    this.getUser(data.session.user.id);
    this.checkUserRole();
    this.isLogged.set(true);
  }

  public async getUser(userId: string) {
    const user = await this.getById<iUser>('users', userId);
    this.currentUser.set(user);
  }

  async checkUserRole(): Promise<void> {
    const { data: userData } = await this.supabaseService.supabase.auth.getUser();
    const user = userData?.user;

    if (user) {
      const userRole = await this.getUserRole(user.id);
      if (userRole?.role === 'admin') {
        this.isAdmin.set(true);
      } else {
        this.isAdmin.set(false);
      }
    }
  }

  async getUserRole(userId: string): Promise<any> {
    const userRole = await this.getByField<{ role: string }>('user_companies', 'user_id', userId);

    return userRole;
  }

  async logout() {
    if (this.isLogged()) {
      const { error } = await this.supabaseService.supabase.auth.signOut();
      if (error) return;
      this.isLogged.set(false);
    }

    this.router.navigate(['/auth'], {
      queryParams: { empresa: this.companyName() },
    });
  }
}
