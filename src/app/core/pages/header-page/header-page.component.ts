import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';
import { CartComponent } from '@shared/components/cart/cart.component';
import { MenuHamburguerComponent } from '@shared/components/menu-hamburguer/menu-hamburguer.component';
import { iMenuItem } from '@shared/components/menu-hamburguer/menu-hamburguer.interface';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-header-page',
  imports: [BackButtonComponent, MenuHamburguerComponent, CartComponent],
  templateUrl: './header-page.component.html',
  styleUrl: './header-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fade]
})
export class HeaderPageComponent {
  @Input() menuItems: iMenuItem[] = [];
  @Input() title!: string;
  @Input() isHome: boolean = false;
  @Input() showInput: boolean = true;
  @Input() link: string = '/'
  @Input() isAdmin: boolean = false;

  public authService = inject(AuthService);
}
