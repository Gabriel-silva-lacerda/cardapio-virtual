import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { iUser } from '../interfaces/user.interface';
import { BaseService } from '@shared/services/base/base.service';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { LoadingService } from '@shared/services/loading/loading.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseSupabaseService {
  public currentUser = signal<iUser | null>(null);
  public isLogged = signal<boolean>(false);
  public isAdmin = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
  }

  public async load() {
    const { data } = await this.supabaseService.supabase.auth.getSession();

    if (!data.session) {
      return;
    }

    // this.currentUser.set(data.session.user as unknown as iUser);

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
}
