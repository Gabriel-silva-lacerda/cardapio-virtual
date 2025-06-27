import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { fade } from '@shared/utils/animations.util';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { HeaderAdminComponent } from '@core/layout/header-admin/header-admin.component';
import { NgClass } from '@angular/common';
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
}

