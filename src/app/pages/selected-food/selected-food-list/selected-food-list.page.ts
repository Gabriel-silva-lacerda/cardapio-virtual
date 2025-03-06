import { FoodDetailsComponent } from './../components/food-details/food-details.component';
import { Component, inject, signal } from '@angular/core';
import { fade } from '@shared/utils/animations.util';
import { ActivatedRoute } from '@angular/router';
import { FooterFoodComponent } from "../components/footer-food/footer-food.component";
import { FoodService } from '@shared/services/food/food.service';
import { iFood } from '@shared/interfaces/food.interface';
import { ExtraService } from '../services/extra.service';
import { iExtra } from '../interfaces/extra.interface';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { iCartItem } from '@shared/interfaces/cart.interface';

@Component({
  selector: 'app-food-menu-list',
  imports: [FoodDetailsComponent, FooterFoodComponent, FormsModule],
  templateUrl: './selected-food-list.page.html',
  styleUrl: './selected-food-list.page.scss',
  animations: [fade],
})
export class SelectdFoodListPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private extraService = inject(ExtraService);
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);
  public carts = this.localStorageService.getSignal<iCartItem[]>('cart', []);

  public food = signal<iFood | null>(null);
  public extras = signal<iExtra[]>([]);

  public id!: string | null;
  public itemId!: string | null;

  public selectedAdditions = signal<{ [key: number]: { id: number; name: string; price: number; quantity: number } }>({});
  public observations = '';
  public productCount = signal<number>(1)


  public newItem = false;

  ngOnInit() {
    this.getRouteId();
  }

  private async getRouteId(): Promise<void> {
    const params = await firstValueFrom(this.route.paramMap);
    console.log(params);

    this.id = params.get('id');
    this.itemId = params.get('itemId');
    if (this.id) {
      this.newItem = true;
      this.loadFoodAndExtras(this.id);
    }

    if (this.itemId) {
      this.newItem = false;
      this.loadCartItemData(this.itemId);
    }
  }

  private async loadFoodAndExtras(foodId: string) {
    try {
      const [food, extras] = await Promise.all([
        this.foodService.getFoodById(foodId),
        this.extraService.getExtrasByFoodId(foodId),
      ]);

      this.food.set(food);
      this.extras.set(extras);
    } catch (error) {
      this.toastr.error('Erro ao carregar comida e extras:', 'Erro');
    }
  }

  private loadCartItemData(itemId: string) {
    const cartItem = this.carts().find((item:any) => item.id === itemId);
    if (cartItem) {
      console.log("LoadCartItem");

      this.selectedAdditions.set(cartItem.extras);
      this.observations = cartItem.observations || '';
      this.productCount.set(cartItem.quantity);
    }
  }
}
