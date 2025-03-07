import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ShowItemService } from '@shared/services/show-item/show-item.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent  {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public showItemService = inject(ShowItemService);
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);

  public links = [
    { path: '/', label: 'Home' },
    { path: '/pedidos', label: 'Pedidos' },
  ];

  public isActive(path: string): boolean {
    return this.router.url === path;
  }
}
