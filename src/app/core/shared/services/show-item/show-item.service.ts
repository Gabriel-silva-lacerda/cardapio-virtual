import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowItemService {
  private showItemSignal = signal<boolean>(false);
  private router = inject(Router);

  public showItem = this.showItemSignal.asReadonly();

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
    const showItem = this.shouldShowItem(cleanUrl);
    this.showItemSignal.set(showItem);
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

  private shouldShowItem(url: string): boolean {
    const routesWithItem = ['/app', '/app/categoria', '/app/perfil'];
    return routesWithItem.includes(url);
  }
}
