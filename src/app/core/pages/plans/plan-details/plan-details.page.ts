import { NgFor, NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plans } from '@shared/interfaces/plans/plans.interface';
import { PlansService } from '@shared/services/plans/plans.service';
import { fade } from '@shared/utils/animations.utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-plan-details',
  imports: [NgIf, NgFor],
  templateUrl: './plan-details.page.html',
  styleUrl: './plan-details.page.scss',
  animations: [fade],
})
export class PlanDetailsPage {
  public plan = signal<Plans>({} as Plans);
  private route = inject(ActivatedRoute);
  private plansService = inject(PlansService);
  // private toastr = inject(ToastrService);
  // private stripeService = inject(StripeService);
  private planId!: number | string | null;
  async ngOnInit() {
    const params = await firstValueFrom(this.route.paramMap);

    this.planId = params.get('id');
    if (this.planId) this.getPlanById(this.planId);
  }

  async getPlanById(planId: string) {
    const plan = await this.plansService.getByField<Plans>(
      'plans',
      'id',
      planId
    );

    this.plan.set(plan as unknown as Plans);
  }
}
