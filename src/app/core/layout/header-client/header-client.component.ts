import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { CartComponent } from '@shared/components/cart/cart.component';
import { iMenuItem } from '@shared/components/side-menu/components/menu-list/menu-list.interface';
import { fade } from '@shared/utils/animations.util';
import { AuthService } from '../../../domain/auth/services/auth.service';

@Component({
  selector: 'app-header-client',
  imports: [BackButtonComponent, CartComponent],
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
  @Input() showCart: boolean = false;
  @Input() link: string = '/'
  @Input() isAdmin: boolean = false;

  public authService = inject(AuthService);
}
