import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private titles: Record<string, string> = {
    '/auth': 'Para continuar, precisaremos de alguns dados',
    '/auth/forgot-password': 'Recupere sua senha facilmente',
    '/auth/reset-password': 'Escolha uma nova senha para sua conta',
  };

  private router = inject(Router);
  private titleSignal = signal<string>('Bem-vindo!');
  public title = this.titleSignal.asReadonly();

  constructor() {
    this.updateTitle(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateTitle(event.url);
        }
      });
  }

  private updateTitle(url: string) {
    const cleanUrl = this.getCleanUrl(url);
    this.titleSignal.set(this.titles[cleanUrl] || 'Bem-vindo!');
  }

  private getCleanUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
