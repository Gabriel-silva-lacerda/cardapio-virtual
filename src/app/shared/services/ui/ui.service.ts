import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  getBottomSpacingClass(url: string): string {
    const base = 'fixed right-2 z-50 group transition-all duration-300 ease-in-out';
    const routeBottomMap: Record<string, string> = {
      '/cart': 'bottom-32',
      '/cardapio/comida': 'bottom-24',
    };
    const bottom = Object.entries(routeBottomMap).find(([r]) => url.includes(r))?.[1] ?? 'bottom-16';
    return `${base} ${bottom}`;
  }
}
