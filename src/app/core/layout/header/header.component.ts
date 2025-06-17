import { Component, inject } from '@angular/core';
import { SideMenuComponent } from '@shared/components/side-menu/side-menu.component';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [SideMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
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
