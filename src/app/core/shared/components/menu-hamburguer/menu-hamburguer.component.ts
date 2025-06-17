import { NgClass, NgIf } from '@angular/common';
import { Component, input, Input, signal } from '@angular/core';
import { iMenuItem } from './menu-hamburguer.interface';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-menu-hamburguer',
  imports: [NgClass, RouterLink, NgIf],
  templateUrl: './menu-hamburguer.component.html',
  styleUrl: './menu-hamburguer.component.scss'
})
export class MenuHamburguerComponent {
  @Input({ required: true }) menuItems: iMenuItem[] = [];

  public menuOpen = signal(false);

  constructor(private router: Router) {
    // Atualiza o item ativo sempre que a rota muda

  }

  ngOnInit() {
    // Atualiza o item ativo ao iniciar
    this.atualizaItensAtivos(this.router.url);

    // Atualiza sempre que a rota mudar
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.atualizaItensAtivos(this.router.url);
    });
  }

  private atualizaItensAtivos(currentUrl: string) {
    this.menuItems.forEach(item => {
      item.active = currentUrl === item.href;
    });
  }

  closeMenu(event: any) {
    if (event.target.classList.contains('bg-black')) {
      this.menuOpen.set(false);
    }
  }

  openMenu() {
    this.menuOpen.set(true);
  }
}
