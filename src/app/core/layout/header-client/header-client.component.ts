import { ChangeDetectionStrategy, Component, inject, input, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { CartComponent } from '@shared/components/cart/cart.component';
import { SideMenuComponent } from '@shared/components/side-menu/side-menu.component';
import { iMenuItem } from '@shared/components/side-menu/components/menu-list/menu-list.interface';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from '../../../domain/auth/services/auth.service';

@Component({
  selector: 'app-header-client',
  imports: [BackButtonComponent, SideMenuComponent, CartComponent],
  templateUrl: './header-client.component.html',
  styleUrl: './header-client.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export class HeaderClientComponent {
  @Input() menuItems: iMenuItem[] = [];
  @Input() title!: string;
  @Input() isHome: boolean = false;
  @Input() showInput: boolean = true;
  @Input() link: string = '/'
  @Input() isAdmin: boolean = false;

  public authService = inject(AuthService);
}
