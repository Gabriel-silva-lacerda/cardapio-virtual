import { inject, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  private titleSubject = new BehaviorSubject<string>('Bem-vindo!');
  public title$ = this.titleSubject.asObservable();

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateTitle();
      }
    });
  }

  private updateTitle() {
    const url = this.router.url;
    this.titleSubject.next(this.titles[url] || 'Bem-vindo!');
  }
}
