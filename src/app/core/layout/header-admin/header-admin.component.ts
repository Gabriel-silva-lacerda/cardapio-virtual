import { Component, inject } from '@angular/core';
import { SideMenuComponent } from '@shared/components/side-menu/side-menu.component';
import { AuthService } from '../../../domain/auth/services/auth.service';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-header-admin',
  imports: [SideMenuComponent],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss'
})
export class HeaderAdminComponent {
  private companyService = inject(CompanyService);
  public authService = inject(AuthService);
public menuItems = [
  {
    label: 'Home',
    href: `/app/${this.companyService.companyName()}/admin`,
    icon: 'fa fa-home'
  },
  {
    label: 'Perfil',
    href: `/app/${this.companyService.companyName()}/admin/perfil`,
    icon: 'fa fa-user'
  },
  {
    label: 'Dashboard',
    href: `/app/${this.companyService.companyName()}/admin/dashboard`,
    icon: 'fa fa-chart-bar'
  },
  {
    label: 'Pedidos',
    href: `/app/${this.companyService.companyName()}/admin/pedidos`,
    icon: 'fa fa-shopping-cart'
  },
  {
    label: 'Produtos',
    href: `/app/${this.companyService.companyName()}/admin/cadastrar-produto`,
    icon: 'fa fa-utensils'
  },
  {
    label: 'Subcategorias',
    href: `/app/${this.companyService.companyName()}/admin/subcategorias`,
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
