import { Component, inject } from "@angular/core";
import { FoodMenuComponent } from "@shared/components/food-menu/food-menu.component";
import { iCartItem } from "@shared/interfaces/cart.interface";
import { LocalStorageService } from "@shared/services/localstorage/localstorage.service";
import { fade } from "@shared/utils/animations.util";
import { HeaderPageComponent } from "src/app/core/pages/header-page/header-page.component";
import { FooterCartComponent } from "../components/footer-cart/footer-cart.component";

@Component({
  selector: 'app-cart-list',
  imports: [HeaderPageComponent, FoodMenuComponent, FooterCartComponent],
  templateUrl: './cart-list.page.html',
  styleUrl: './cart-list.page.scss',
  animations: [fade],
})
export class CartListPage {
  private localStorageService = inject(LocalStorageService);
  public carts = this.localStorageService.getSignal<iCartItem[]>('cart', []);

  constructor() {
    // console.log(this.carts());
  }
}
