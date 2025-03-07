import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { Component, inject } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private localStorageService = inject(LocalStorageService);
  public showItemService = inject(ShowItemService);
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);
}
