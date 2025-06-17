import { Component, inject } from '@angular/core';
import { HeaderPageComponent } from "../../../core/pages/header-page/header-page.component";
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { fade, fadeInOut } from '@shared/utils/animations.utils';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-home-page',
  imports: [HeaderPageComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade]
})
export class HomePage {
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    ''
  );
  public authService = inject(AuthService);
  public menuItems = [
    {
      label: 'Home',
      href: '/app/admin',
      icon: 'fa fa-home'
    },
    {
      label: 'Perfil',
      href: '/admin/perfil',
      icon: 'fa fa-user'
    },
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'fa fa-chart-bar'
    },
    {
      label: 'Pedidos',
      href: '/admin/pedidos',
      icon: 'fa fa-shopping-cart'
    },
    {
      label: 'Produtos',
      href: '/admin/produtos',
      icon: 'fa fa-utensils'
    },
    {
      label: 'Subcategorias',
      href: '/admin/subcategorias',
      icon: 'fa fa-th-large'
    },
    {
      label: 'Sair',
      isButton: true,
      icon: 'fa fa-sign-out-alt',
      action: () => {
        this.authService.logout();
      }
    }
  ];
}
