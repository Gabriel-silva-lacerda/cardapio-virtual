import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ShowItemService } from '@shared/services/show-item/show-item.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, NgClass],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy  {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private destroy$ = new Subject<void>();

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public showItemService = inject(ShowItemService);
  public cart = this.localStorageService.getSignal<iCartItem[]>('cart', []);
  public links = [
    { path: '/app', label: 'Home' },
    { path: 'perfil', label: 'Perfil' },
    { path: 'pedidos', label: 'Pedidos' },
  ];
  public activeLinks: { [key: string]: boolean } = {};

  ngOnInit() {
    this.updateActiveLinks();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)).subscribe(() => this.updateActiveLinks());
  }

  private updateActiveLinks(): void {
    const cleanUrl = this.router.url.split('?')[0];
    this.activeLinks = {};

    this.links.forEach(link => {
      const fullPath = link.path.startsWith('/app') ? link.path : `/app/${link.path}`;
      console.log(fullPath);

      this.activeLinks[link.path] = cleanUrl === fullPath;
      console.log(this.activeLinks);

    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
