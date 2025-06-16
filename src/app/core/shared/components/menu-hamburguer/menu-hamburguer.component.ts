import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-hamburguer',
  imports: [NgClass],
  templateUrl: './menu-hamburguer.component.html',
  styleUrl: './menu-hamburguer.component.scss'
})
export class MenuHamburguerComponent {
  public menuOpen = false;
  closeMenu(event: any) {

  }

  openMenu() {

  }
}
