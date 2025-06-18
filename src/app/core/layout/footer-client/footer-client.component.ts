import { NgClass, NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';

import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { fadeInOut } from '@shared/utils/animations.utils';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../domain/auth/services/auth.service';

@Component({
  selector: 'app-footer-client',
  imports: [RouterLink, NgClass],
  templateUrl: './footer-client.component.html',
  styleUrl: './footer-client.component.scss',
  animations: [fadeInOut],
})
export class FooterClientComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private destroy$ = new Subject<void>();

  public authService = inject(AuthService);
  public showItemService = inject(ShowItemService);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);
  public links = this.buildLinks();
  public activeLinks: Record<string, boolean> = {};

  ngOnInit() {
    this.updateActiveLinks();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateActiveLinks());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildLinks(): { path: string; label: string }[] {
    const links = [{ path: '/app', label: 'Home' }];

    if (this.authService.isLogged()) {
      links.push(
        { path: '/app/perfil', label: 'Perfil' },
        { path: '/app/pedidos', label: 'Pedidos' }
      );
    } else {
      links.push({ path: '/auth', label: 'Fazer login' });
    }

    return links;
  }

  private updateActiveLinks(): void {
    const cleanUrl = this.router.url.split('?')[0];
    this.activeLinks = {};

    for (const link of this.links) {
      const fullPath = link.path.startsWith('/app') ? link.path : `/app/${link.path}`;

      this.activeLinks[link.path] =
        link.path === '/app'
          ? cleanUrl === '/app' || cleanUrl.startsWith('/app/cardapio') || cleanUrl.startsWith('/app/categorias')
          : cleanUrl === fullPath;
    }
  }
}

