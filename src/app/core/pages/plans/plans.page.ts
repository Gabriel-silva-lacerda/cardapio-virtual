import { NgClass, NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Plans } from '@shared/interfaces/plans.interface';
import { PlansService } from '@shared/services/plans/plans.service';
import { fade } from '@shared/utils/animations.utils';

@Component({
  selector: 'app-plans',
  imports: [NgClass, NgIf],
  templateUrl: './plans.page.html',
  styleUrl: './plans.page.scss',
  animations: [fade]
})
export class PlansPage implements OnInit {
  private plansService = inject(PlansService);
  private router = inject(Router);
  public plans = signal<Plans[]>([])
  public menuOpen = false;

  async ngOnInit() {
    const plans = await this.plansService.getAll<Plans>('plans');
    this.plans.set(plans);
  }

  goToCheckout(plan: Plans) {
    this.router.navigate(['/planos/pagamento', plan.id]);
  }

  closeMenu(event: MouseEvent) {
    const menu = document.querySelector('.fixed.top-0.right-0');
    if (menu && !menu.contains(event.target as Node)) {
      this.menuOpen = false;
    }
  }

  scrollToPlans() {
    const plansSection = document.querySelector('#plansSection');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
