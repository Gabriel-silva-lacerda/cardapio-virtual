import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';

import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  public showItemService = inject(ShowItemService);
  public links = this.getLinks();
  public activeLinks: { [key: string]: boolean } = {};
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);

  async ngOnInit() {
    this.updateActiveLinks();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateActiveLinks());
  }

  private getLinks(): { path: string; label: string }[] {
    const baseLinks = [
      { path: '/app', label: 'Home' },
    ];

    if (this.authService.isLogged()) {
      baseLinks.push(
        { path: 'perfil', label: 'Perfil' },
        { path: 'pedidos', label: 'Pedidos' }
      );
    } else {
      console.log("aqui");

      baseLinks.push({ path: '/auth', label: 'Fazer login' });
    }

    console.log(baseLinks);

    return baseLinks;
  }

  private updateActiveLinks(): void {
    const cleanUrl = this.router.url.split('?')[0];
    this.activeLinks = {};

    this.links.forEach((link) => {
      const fullPath = link.path.startsWith('/app') ? link.path : `/app/${link.path}`;
      this.activeLinks[link.path] = cleanUrl === fullPath;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
