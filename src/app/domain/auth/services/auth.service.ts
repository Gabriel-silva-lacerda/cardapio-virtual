import {inject, Injectable, signal } from '@angular/core';
import { iUser } from '../interfaces/user.interface';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { Router } from '@angular/router';
import { Company } from '@shared/interfaces/company/company';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CompanyService } from '@shared/services/company/company.service';
import { UserCompanyService } from './user-company.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseSupabaseService {
  protected override table = 'users';
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private userCompanyService = inject(UserCompanyService)

  public currentUser = signal<iUser | null>(null);
  public isLogged = signal<boolean>(false);
  public isAdmin = signal<boolean>(false);

  private _adminMode = signal<boolean>(false);
  public adminMode = this._adminMode.asReadonly();

  public async load() {
    const { data, error } = await this.supabaseService.supabase.auth.getSession();
    if (!data.session || error) {
      return;
    }

    await this.getUser(data.session.user.id);
    await this.checkUserRole();
    this.isLogged.set(true);
  }

  public async getUser(userId: string) {
    const user = await this.getById<iUser>(userId);
    this.currentUser.set(user);
  }

  async checkUserRole(): Promise<void> {
    const { data: userData } = await this.supabaseService.supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    const userRole = await this.getUserRole(user.id);

    if (userRole?.role === 'admin') {
      this.isAdmin.set(true);

      const saved = localStorage.getItem('adminMode');
      if (saved === null) {
        this.setAdminMode(true);
      } else {
        this._adminMode.set(saved === 'true');
      }

    } else {
      this.isAdmin.set(false);
      this.setAdminMode(false);
    }
  }

  async getUserRole(userId: string): Promise<any> {
    return await this.userCompanyService.getByField<{ role: string }>('user_id', userId);
  }

  async logout() {
    if (this.isLogged()) {
      const { error } = await this.supabaseService.supabase.auth.signOut();
      if (error) return;
      this.isLogged.set(false);
    }

    this.router.navigate(['/auth', this.companyService.companyName()]);
  }

  setAdminMode(value: boolean) {
    this._adminMode.set(value);
    localStorage.setItem('adminMode', value.toString());
  }

  resetAdminMode() {
    localStorage.removeItem('adminMode');
    this._adminMode.set(this.isAdmin());
  }
}

