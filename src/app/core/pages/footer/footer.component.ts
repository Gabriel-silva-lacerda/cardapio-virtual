import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { FooterService } from '@shared/services/title/footer.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private router = inject(Router);
  public footerService = inject(FooterService)

  public links = [
    { path: '/', label: 'Home' },
    // { path: '/cardapio', label: 'Cardápio' },
    { path: '/pedidos', label: 'Carrinho' },
    { path: '/pedidos', label: 'Pedidos' },
  ];

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
