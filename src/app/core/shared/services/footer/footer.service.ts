import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private showFooterSignal = signal<boolean>(false);
  private router = inject(Router);

  public showFooter = this.showFooterSignal.asReadonly();

  constructor() {
    this.updateFooterVisibility(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateFooterVisibility(event.url);
      }
    });
  }

  private updateFooterVisibility(url: string) {
    let cleanUrl = url.split('?')[0].split('#')[0];

    cleanUrl = cleanUrl.split('/')[1] ? `/${cleanUrl.split('/')[1]}` : cleanUrl;

    const showFooter = this.shouldShowFooter(cleanUrl);
    this.showFooterSignal.set(showFooter);
  }

  private shouldShowFooter(url: string): boolean {
    const routesWithFooter = ['/', '/categoria', '/contact'];
    return routesWithFooter.includes(url);
  }
}
