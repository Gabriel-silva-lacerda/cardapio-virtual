import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PageLayoutClientComponent } from '@shared/components/page-layout-client/page-layout-client.component';
import { injectSupabase } from '@shared/functions/inject-supabase.function';
import { Company } from '@shared/interfaces/company/company';
import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { StripeService } from '@shared/services/stripe/stripe.service';
import { expandAnimation, fade } from '@shared/utils/animations.utils';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [LoadingComponent, PageLayoutClientComponent],
  templateUrl: './perfil.page.html',
  styleUrl: './perfil.page.scss',
  animations: [fade, expandAnimation],
})
export class PerfilPage {
  private supabase = injectSupabase();
  private router = inject(Router);
  private stripeService = inject(StripeService);
  private localStorageService = inject(LocalStorageService);
  private companyService = inject(CompanyService);
  private toastr = inject(ToastrService);
  private companyData = signal<Company>({} as Company);
  private destroy$ = new Subject<void>();
  private companyId = this.localStorageService.getSignal('companyId', 0);

  public authService = inject(AuthService);
  public loading = signal(false);
  public isLogged = this.authService.isLogged;
  public currentUser = this.authService.currentUser;
  public userInitialSignal = signal<string>('');
  public stripeOpen = false;
  public isActive = false;

  async ngOnInit() {
    this.updateUserInitial();
    this.loadCompanyData();
    if (!this.companyData()?.account_id) return;
    this.checkAccountStatus();
  }

  async loadCompanyData() {
    this.companyData.set(await this.companyService.getByField<Company>('id',this.companyId()));
  }

  async logout() {
    if (this.isLogged()) {
      const { error } = await this.supabase.auth.signOut();
      if (error) return;
      this.authService.isLogged.set(false);
    }

    this.router.navigate(['/auth']);
  }

  toggleStripe() {
    this.stripeOpen = !this.stripeOpen;
  }

  checkAccountStatus() {
    this.loading.set(true);

    this.stripeService
      .checkAccountStatus(this.companyData().account_id as string)
      .subscribe({
        next: (response) => this.isActive = response.data.isActive,
        complete: () => this.loading.set(false),
      });
  }

  createStripeAccount() {
    if (!this.companyData()?.email) {
      this.toastr.error('Email da empresa não encontrado.');
      return;
    }

    this.stripeService
      .createConnectedAccount(this.companyData().email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stripeResponse) => {
          this.createAccountLink(stripeResponse.data.accountId,this.companyData()?.unique_url as string);
          this.localStorageService.setItem(`stripeAccountCreated-${this.companyId()}`, true);
        },
      });
  }

  createAccountLink(accountId: string, email: string) {
    this.stripeService
      .createAccountLink(accountId, email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data.accountLink)
            window.location.href = response.data.accountLink;
        },
      });
  }

  loginStripe() {
    this.loading.set(true);

    if (!this.companyData()?.account_id) return;

    this.stripeService.getExpressLoginLink(this.companyData().account_id as string).subscribe({
      next: (response) => {
        if (response.data?.url) window.location.href = response.data.url;
      },
    });
  }

  private updateUserInitial() {
    const fullName = this.currentUser()?.full_name || '';
    const initial = fullName.charAt(0).toUpperCase();
    this.userInitialSignal.set(initial);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
