import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Company } from '@shared/interfaces/company';
import { StripeService } from '@shared/services/stripe/stripe.service';
import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-successfull-payment-plan',
  imports: [RouterLink],
  templateUrl: './successfull-payment-plan.page.html',
  styleUrl: './successfull-payment-plan.page.scss'
})
export class SuccessfullPaymentPlanPage {
  private stripeService = inject(StripeService);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    const companyId = this.route.snapshot.paramMap.get('id');

    const stripeAccountCreated = this.localStorageService.getItem(`stripeAccountCreated-${companyId}`)
    // if (companyId && !stripeAccountCreated)
    //   this.createStripeAccount(+companyId);
  }

  createStripeAccount(companyId: number) {
    this.companyService.getByField<Company>('companies', 'id', companyId)
      .then(company => {
        if (!company?.email) {
          this.toastr.error('Email da empresa não encontrado.');
          return;
        }

        this.stripeService.createConnectedAccount(company.email).pipe(takeUntil(this.destroy$))
          .subscribe({ next: (stripeResponse) => {
            this.createAccountLink(stripeResponse.accountId, company.name)
            this.localStorageService.setItem(`stripeAccountCreated-${companyId}`, true);
          }});
      })
  }

  createAccountLink(accountId: string, email: string) {
    this.stripeService.createAccountLink(accountId, email).pipe(takeUntil(this.destroy$))
      .subscribe({ next: (accountLink) =>  window.location.href = accountLink.url });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
