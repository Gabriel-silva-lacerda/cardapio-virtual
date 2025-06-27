import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { Plans } from '@shared/interfaces/plans/plans.interface';
import { PlansService } from '@shared/services/plans/plans.service';
import { fade } from '@shared/utils/animations.util';
import { SearchCompanyDialogComponent } from './components/search-company-dialog/search-company-dialog.component';

@Component({
  selector: 'app-plans',
  imports: [NgClass, NgIf, NgFor, FormsModule],
  templateUrl: './plans.page.html',
  styleUrl: './plans.page.scss',
  animations: [fade],
})
export class PlansPage implements OnInit {
  private plansService = inject(PlansService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  public plans = signal<Plans[]>([]);
  public menuOpen = false;

  openCompanySearchModal() {
    const dialogRef = this.dialog.open(SearchCompanyDialogComponent, {
      width: window.innerWidth > 768 ? '1000px' : '400px',
      maxWidth: '100%',
    });
  }

  async ngOnInit() {
    const plans = await this.plansService.getAll<Plans>();
    this.plans.set(plans);
  }

  goToRoute(link: string, data: string) {
    this.router.navigate([link, data]);
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
