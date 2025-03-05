import { NgClass, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { FooterService } from '@shared/services/title/footer.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgClass, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent  {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  public footerService = inject(FooterService);
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);

  public links = [
    { path: '/', label: 'Home' },
    // { path: '/cardapio', label: 'Cardápio' },
    { path: '/cart', label: 'Carrinho', quantity: 0 },
    { path: '/pedidos', label: 'Pedidos' },
  ];

  public isActive(path: string): boolean {
    return this.router.url === path;
  }
}
