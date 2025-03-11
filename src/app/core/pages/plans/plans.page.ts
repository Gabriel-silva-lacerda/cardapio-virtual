import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Plans } from '@shared/interfaces/plans.interface';
import { PlansService } from '@shared/services/plans/plans.service';

@Component({
  selector: 'app-plans',
  imports: [],
  templateUrl: './plans.page.html',
  styleUrl: './plans.page.scss'
})
export class PlansPage implements OnInit {
  private plansService = inject(PlansService);
  private router = inject(Router);
  public plans = signal<Plans[]>([])

  async ngOnInit() {
    const plans = await this.plansService.getAll<Plans>('plans');
    this.plans.set(plans);
  }

  goToCheckout(plan: Plans) {
    this.router.navigate(['/planos/pagamento', plan.id]);
  }

}
