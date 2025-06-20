import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowItemService {
  private showCartSignal = signal<boolean>(false);
  private showFooterSignal = signal<boolean>(false);
  private router = inject(Router);

  public showCart = this.showCartSignal.asReadonly();
  public showFooter = this.showFooterSignal.asReadonly();

  constructor() {
    this.updateItemVisibility(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateItemVisibility(event.url);
        }
      });
  }

  private updateItemVisibility(url: string) {
    const cleanUrl = this.getCleanUrl(url);
    this.showCartSignal.set(this.shouldShowCart(cleanUrl));
    this.showFooterSignal.set(this.shouldShowFooter(cleanUrl));
  }


  private getCleanUrl(url: string): string {
    const urlWithoutParams = url.split('?')[0].split('#')[0];
    const segments = urlWithoutParams.split('/').filter((segment) => segment);

    if (segments[0] === 'app') segments.splice(1, 1);

    return '/' + segments.join('/');
  }

  private shouldShowCart(url: string): boolean {
    const routesWithCart = ['/app', '/app/categoria'];
    return routesWithCart.includes(url);
  }

  private shouldShowFooter(url: string): boolean {
    const routesWithFooter = ['/app', '/app/categoria', '/app/perfil', '/app/comidas'];
    return routesWithFooter.includes(url);
  }
}
