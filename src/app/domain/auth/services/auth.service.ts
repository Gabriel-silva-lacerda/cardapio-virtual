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
  public isLogged = signal(false);
  public isAdmin = signal(false);

  private _adminMode = signal(false);
  public adminMode = this._adminMode.asReadonly();

  // Inicializa o usuário e seu papel
  public async load() {
    const { data, error } = await this.supabaseService.supabase.auth.getSession();
    if (!data.session || error) return;

    await this.getUser(data.session.user.id);
    await this.resolveUserRole(data.session.user.id);
    this.isLogged.set(true);
  }

  public async getUser(userId: string) {
    const user = await this.getById<iUser>(userId);
    this.currentUser.set(user);
  }

  private async resolveUserRole(userId: string) {
    const userRole = await this.getUserRole(userId);
    const isAdmin = userRole?.role === 'admin';
    this.isAdmin.set(isAdmin);

    const sessionAlreadyStarted = sessionStorage.getItem('sessionStarted') === 'true';
    const savedAdminMode = localStorage.getItem('adminMode');

    if (isAdmin) {
      const shouldForceAdmin = !sessionAlreadyStarted || savedAdminMode === null;
      this.setAdminMode(shouldForceAdmin ? true : savedAdminMode === 'true');
    } else {
      this.setAdminMode(false);
    }

    sessionStorage.setItem('sessionStarted', 'true');
  }

  public async getUserRole(userId: string): Promise<{ role: string } | null> {
    return this.userCompanyService.getByField<{ role: string }>('user_id', userId);
  }

  public async logout() {
    if (this.isLogged()) {
      const { error } = await this.supabaseService.supabase.auth.signOut();
      if (!error) {
        this.clearSession();
      }
    }

    this.router.navigate(['/auth', this.companyService.companyName()]);
  }

  public setAdminMode(value: boolean) {
    this._adminMode.set(value);
    localStorage.setItem('adminMode', value.toString());
  }

  public resetAdminMode() {
    localStorage.removeItem('adminMode');
    this._adminMode.set(this.isAdmin());
  }

  private clearSession() {
    this.isLogged.set(false);
    this.isAdmin.set(false);
    this.resetAdminMode();
    this.currentUser.set(null);
  }
}
