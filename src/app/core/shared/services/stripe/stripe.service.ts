import { loadStripe } from '@stripe/stripe-js';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { environment } from '@enviroment/environment.development';
import { Company } from '@shared/interfaces/company/company';
import { LocalStorageService } from '../localstorage/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class StripeService extends BaseService {
  private stripePromise = loadStripe(environment.STRIPE_KEY);
  private localStorageService = inject(LocalStorageService);

  async createCheckoutSession(
    priceId: string,
    company: Company | undefined,
    fullName: string,
    planId: string
  ) {
    this.loadingService.showLoading();

    this.post<{ sessionId: string }>(
      { priceId, company, fullName, planId },
      'payment/create-checkout-session'
    )
      .pipe(finalize(() => this.loadingService.hideLoading()))
      .subscribe(async (response) => {
        console.log(response);

        const stripe = await this.stripePromise;
        const { sessionId } = response;

        this.localStorageService.setItem('payment_pending', 'true');
        await stripe!.redirectToCheckout({ sessionId });
      });
  }

  createConnectedAccount(email: string): Observable<{ accountId: string }> {
    return this.post<{ accountId: string }>(
      { email },
      'payment/create-connected-account'
    );
  }

  createAccountLink(
    accountId: string,
    companyName: string
  ): Observable<{ url: string }> {
    return this.post<{ url: string }>(
      { accountId, companyName },
      'payment/create-account-link'
    );
  }

  checkAccountStatus(accountId: string): Observable<{ isActive: boolean }> {
    return this.getById<{ isActive: boolean }>(
      accountId,
      'payment/check-account-status'
    );
  }

  getExpressLoginLink(accountId: string): Observable<{ url: string }> {
    return this.post<{ url: string }>(
      { accountId },
      'payment/get-express-login'
    );
  }
}
