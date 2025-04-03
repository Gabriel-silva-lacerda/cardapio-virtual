import { loadStripe } from '@stripe/stripe-js';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { environment } from '@enviroment/environment.development';
import { Company } from '@shared/interfaces/company/company';
import { LocalStorageService } from '../localstorage/localstorage.service';
import { iApiResponse } from '@shared/interfaces/api/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class StripeService extends BaseService {
  private stripePromise = loadStripe(environment.STRIPE_KEY);
  private localStorageService = inject(LocalStorageService);

  async createCheckoutSession(priceId: string, company: Company | undefined, fullName: string, planId: string) {
    this.loadingService.showLoading();
  
    this.post<iApiResponse<{ sessionId: string }>>(
      { priceId, company, fullName, planId },
      'payment/create-checkout-session'
    )
      .pipe(finalize(() => this.loadingService.hideLoading()))
      .subscribe(async (response) => {
        console.log(response);
  
        if (response.error) {
          this.toastr.error(response.message, 'Erro');
          return;
        }
  
        const stripe = await this.stripePromise;
        const { sessionId } = response.data;
  
        this.localStorageService.setItem('payment_pending', 'true');
        await stripe!.redirectToCheckout({ sessionId });
      });
  }
  
  createConnectedAccount(email: string): Observable<iApiResponse<{ accountId: string }>> {
    return this.post<iApiResponse<{ accountId: string }>>(
      { email },
      'payment/create-connected-account'
    );
  }
  
  createAccountLink(accountId: string, companyName: string): Observable<iApiResponse<{ accountLink: string }>> {
    return this.post<iApiResponse<{ accountLink: string }>>(
      { accountId, companyName },
      'payment/create-account-link'
    );
  }
  
  checkAccountStatus(accountId: string): Observable<iApiResponse<{ isActive: boolean }>> {
    return this.getById<iApiResponse<{ isActive: boolean }>>(
      accountId,
      'payment/check-account-status'
    );
  }
  
  getExpressLoginLink(accountId: string): Observable<iApiResponse<{ url: string }>> {
    return this.post<iApiResponse<{ url: string }>>(
      { accountId },
      'payment/get-express-login'
    );
  }
  
}
