import { SideMenuService } from './../../../shared/components/side-menu/services/side-menu.service';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FooterClientComponent } from '@core/layout/footer-client/footer-client.component';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { HeaderAdminComponent } from '@core/layout/header-admin/header-admin.component';
import { NgClass, NgStyle } from '@angular/common';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterClientComponent, HeaderAdminComponent, NgClass, RouterLink],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent implements OnInit {
  private router = inject(Router);
  public companyService = inject(CompanyService);
  public authService = inject(AuthService);
  public sideMenuService = inject(SideMenuService);
  public isCartRoute = false;

  ngOnInit(): void {
    this.updateCartRouteStatus(this.router.url);
    this.listenToRouterEvents();
    this.redirectIfRootAppRoute();
  }

  private listenToRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateCartRouteStatus(event.urlAfterRedirects);
      }
    });
  }

  private updateCartRouteStatus(url: string): void {
    this.isCartRoute = url.includes('/cart');
  }

  private redirectIfRootAppRoute(): void {
    if (!this.isCurrentUrlRootAppRoute()) return;

    const queryParams = { empresa: this.companyService.companyName() };
    const targetRoute = this.getInitialRedirectRoute();

    this.router.navigate(targetRoute, { queryParams });
  }

  private isCurrentUrlRootAppRoute(): boolean {
    return this.router.url.split('?')[0] === '/app';
  }

  private getInitialRedirectRoute(): string[] {
    return this.authService.isAdmin() && this.authService.adminMode()
      ? ['/app/admin']
      : ['/'];
  }
}
