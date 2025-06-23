import { Component, effect, inject, signal } from '@angular/core';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { fadeInOut } from '@shared/utils/animations.utils';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  animations: [fadeInOut],
})
export class CartComponent {
  private localStorageService = inject(LocalStorageService);

  public authService = inject(AuthService);
  public cart = signal<iCartItem[]>([]);

  constructor() {
    effect(() => {
      const userId = this.authService.currentUser()?.id;

      if (userId) {
        const cartKey = `cart-${userId}`;
        const savedCart = this.localStorageService.getSignal<iCartItem[]>(
          cartKey,
          []
        );
        this.cart.set(savedCart());
      }
    });
  }
}
