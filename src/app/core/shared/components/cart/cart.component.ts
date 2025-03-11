import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { Component, inject } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { RouterLink } from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private localStorageService = inject(LocalStorageService);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public showItemService = inject(ShowItemService);
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);
}
