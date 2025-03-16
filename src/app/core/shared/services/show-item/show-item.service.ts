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
    const lastSegment = segments[segments.length - 1];

    if (lastSegment && !isNaN(Number(lastSegment))) {
      segments.pop();
    }

    return `/${segments.join('/')}`;
  }

  private shouldShowCart(url: string): boolean {
    const routesWithCart = ['/app', '/app/categoria'];
    return routesWithCart.includes(url);
  }

  private shouldShowFooter(url: string): boolean {
    const routesWithFooter = ['/app', '/app/categoria', '/app/perfil'];
    return routesWithFooter.includes(url);
  }
}
