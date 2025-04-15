import { Component, inject, OnInit, signal } from '@angular/core';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { fade } from '@shared/utils/animations.utils';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { FooterCartComponent } from '../components/footer-cart/footer-cart.component';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-cart-list',
  imports: [HeaderPageComponent, FoodMenuComponent, FooterCartComponent],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
  animations: [fade],
})
export class CartPage implements OnInit {
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);
  public carts = signal<iCartItem[]>([]);

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;

    if (userId) {
      const cartKey = `cart-${userId}`;
      this.carts.set(
        this.localStorageService.getItem<iCartItem[]>(cartKey) || []
      );
    }
  }
}
