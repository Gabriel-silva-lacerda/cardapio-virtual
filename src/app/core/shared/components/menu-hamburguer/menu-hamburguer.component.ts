import { NgClass } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { iMenuItem } from './menu-hamburguer.interface';

@Component({
  selector: 'app-menu-hamburguer',
  imports: [NgClass],
  templateUrl: './menu-hamburguer.component.html',
  styleUrl: './menu-hamburguer.component.scss'
})
export class MenuHamburguerComponent {
  @Input({ required: true }) menuItems: iMenuItem[] = [];
  public menuOpen = signal(false);

  closeMenu(event: any) {
    if (event.target.classList.contains('bg-black')) {
      this.menuOpen.set(false);
    }
  }

  openMenu() {
    alert('Pesquisar Empresa clicado!');
    this.menuOpen.set(false);
  }
}
