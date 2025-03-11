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
    // Remove a parte de query params e fragmentos
    let cleanUrl = url.split('?')[0].split('#')[0];

    // Considera o caminho da URL
    cleanUrl = cleanUrl.split('/')[1] ? `/${cleanUrl.split('/')[1]}` : cleanUrl;

    // Verifica se a URL com o parâmetro de empresa existe
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const empresa = queryParams.get('empresa');

    // Agora você pode fazer o controle com base na URL limpa e no query param
    const showItem = this.shouldShowItem(cleanUrl, empresa);
    this.showItemSignal.set(showItem);
  }

  private shouldShowItem(url: string, empresa: string | null): boolean {
    // Defina suas rotas de interesse, considerando o parâmetro 'empresa' se necessário
    const routesWithItem = ['/app', '/categoria', '/contact'];

    // Verifica se a URL está entre as rotas de interesse e se a empresa não está vazia
    return routesWithItem.includes(url) && empresa !== null;
  }
}
