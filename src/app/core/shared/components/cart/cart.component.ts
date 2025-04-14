import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { Component, effect, inject, signal } from '@angular/core';

import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private localStorageService = inject(LocalStorageService);
  public authService = inject(AuthService);

  public showItemService = inject(ShowItemService);

  public cart = signal<iCartItem[]>([]);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );

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
