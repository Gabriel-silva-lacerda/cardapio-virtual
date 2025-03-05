import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

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
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });
  }

  private updateTitle() {
    const url = this.router.url;
    this.titleSignal.set(this.titles[url] || 'Bem-vindo!');
  }
}
