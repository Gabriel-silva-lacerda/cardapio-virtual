import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { HeaderAdminComponent } from '@core/layout/header-admin/header-admin.component';
import { NgClass, NgStyle } from '@angular/common';
import { CompanyService } from '@shared/services/company/company.service';
import { UiService } from '@shared/services/ui/ui.service';
import { SideMenuService } from '@shared/components/side-menu/services/side-menu.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, HeaderAdminComponent, NgClass, RouterLink],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent implements OnInit {
  private router = inject(Router);
  private uiService = inject(UiService);
  public companyService = inject(CompanyService);
  public authService = inject(AuthService);
  public sideMenuService = inject(SideMenuService);
  public adminReturnButtonClass = '';

  ngOnInit(): void {
    this.updateButtonState(this.router.url);
    this.listenToRouterEvents();
    this.redirectIfRootAppRoute();
  }

  private listenToRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateButtonState(event.urlAfterRedirects);
      }
    });
  }

  private updateButtonState(url: string): void {
    this.adminReturnButtonClass = this.uiService.getBottomSpacingClass(url);
  }

  private redirectIfRootAppRoute(): void {
    if (!this.isCurrentUrlRootAppRoute()) return;

    const targetRoute = this.getInitialRedirectRoute();

    this.router.navigate(targetRoute);
  }

  private isCurrentUrlRootAppRoute(): boolean {
    return this.router.url.split('?')[0] === '/app';
  }

  private getInitialRedirectRoute(): string[] {
    const companyName = this.companyService.companyName();
    if (this.authService.isAdmin() && this.authService.adminMode()) {
      return ['/app/admin', companyName];
    } else {
      return ['/', companyName];
    }
  }
}

