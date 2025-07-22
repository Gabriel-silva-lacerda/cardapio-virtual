import { FoodDetailsComponent } from '../components/food-details/food-details.component';
import { Component, inject, signal } from '@angular/core';
import { fade } from '@shared/utils/animations.util';
import { ActivatedRoute } from '@angular/router';
import { FooterFoodComponent } from '../components/footer-food/footer-food.component';
import { FoodService } from '@shared/services/food/food.service';
import { iFood } from '@shared/interfaces/food/food.interface';

import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { ExtraService } from '@shared/services/extra/extra.service';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { FoodApi } from '@shared/api/food/food.api';

@Component({
  selector: 'app-food-view',
  imports: [FoodDetailsComponent, FooterFoodComponent, FormsModule],
  templateUrl: './menu-item-detail-page.html',
  styleUrl: './menu-item-detail-page.scss',
  animations: [fade],
})
export class MenuItemDetailPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private foodApi = inject(FoodApi);
  private extraService = inject(ExtraService);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);

  public food = signal<iFood | null>(null);
  public extras = signal<iExtra[]>([]);
  public id!: string | null;
  public itemId!: string | null;
  public carts = signal<iCartItem[]>([]);

  public newItem = false;

  ngOnInit() {
    this.getRouteId();

    const userId = this.authService.currentUser()?.id;

    if (userId) {
      const cartKey = `cart-${userId}`;
      this.carts.set(
        this.localStorageService.getItem<iCartItem[]>(cartKey) || []
      );
    }
  }

  private async getRouteId(): Promise<void> {
    const params = await firstValueFrom(this.route.paramMap);
    this.id = params.get('id');
    this.itemId = params.get('itemId');

    if (this.id) {
      this.newItem = true;
      this.foodService.resetFoodValues();
      await this.loadFoodAndExtras(this.id);
    }

    if (this.itemId) {
      this.newItem = false;
      this.loadCartItemData(this.itemId);
    }
  }

  private async loadFoodAndExtras(foodId: string) {
    const [food, extras] = await Promise.all([
      this.foodApi.getFoodById(foodId),
      this.extraService.getExtrasByFoodId(foodId),
    ]);

    this.food.set(food);
    this.extras.set(extras);
  }

  private loadCartItemData(itemId: string) {
    const cartItem = this.carts().find((item) => item.id === itemId);

    if (cartItem) {
      this.foodService.selectedAdditions.set(cartItem.extras);
      this.foodService.observations.set(cartItem.observations || '');
      this.foodService.productCount.set(cartItem.quantity);
    }
  }
}
