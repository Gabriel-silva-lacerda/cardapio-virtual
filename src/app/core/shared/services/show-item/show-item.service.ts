import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ShowItemService {
  private showItemSignal = signal<boolean>(false);
  private router = inject(Router);

  public showItem = this.showItemSignal.asReadonly();

  constructor() {
    this.updateItemVisibility(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateItemVisibility(event.url);
      }
    });
  }

  private updateItemVisibility(url: string) {
    let cleanUrl = url.split('?')[0].split('#')[0];

    cleanUrl = cleanUrl.split('/')[1] ? `/${cleanUrl.split('/')[1]}` : cleanUrl;

    const showItem = this.shouldShowItem(cleanUrl);
    this.showItemSignal.set(showItem);
  }

  private shouldShowItem(url: string): boolean {
    const routesWithItem = ['/', '/categoria', '/contact'];
    return routesWithItem.includes(url);
  }
}
