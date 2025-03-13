import { loadStripe } from '@stripe/stripe-js';
import { Injectable } from '@angular/core';
import { BaseService } from './base/base.service';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService extends BaseService{
  private stripePromise = loadStripe(environment.STRIPE_KEY);

  async createCheckoutSession(priceId: string, companyId: number) {

    // Fazendo a requisição para o backend para criar a sessão de checkout
    this.post<{ sessionId: string }>({ priceId, companyId },  'Payment/create-checkout-session')
      .subscribe(async (response) => {
        const stripe = await this.stripePromise;
        const { sessionId } = response;

        // Redireciona o usuário para o checkout da Stripe
        const result = await stripe!.redirectToCheckout({ sessionId });

        if (result.error) {
          console.error(result.error.message); // Exibe o erro, se houver
        }
      });
  }

  createConnectedAccount(email: string): Observable<{ accountId: string }> {
    return this.post<{ accountId: string }>({ email }, 'Payment/create-connected-account');
  }

  createAccountLink(accountId: string, companyName: string): Observable<{ url: string }> {
    return this.post<{ url: string }>({ accountId, companyName }, 'Payment/create-account-link');
  }

}
