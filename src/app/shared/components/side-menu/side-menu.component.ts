import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { iMenuItem } from './components/menu-list/menu-list.interface';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MenuMobileComponent } from './components/menu-mobile/menu-mobile.component';
import { MenuListComponent } from './components/menu-list/menu-list.component';
import { NgClass } from '@angular/common';
import { SideMenuService } from './services/side-menu.service';

@Component({
  selector: 'app-side-menu',
  imports: [MenuMobileComponent, MenuListComponent, NgClass],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  @Input({ required: true }) menuItems: iMenuItem[] = []
  private router = inject(Router);

  public collapsed = false;
  public menuOpen = signal(false);
  public sideMenuService = inject(SideMenuService);

  ngOnInit() {
    this.atualizaItensAtivos(this.router.url);

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd)
    ).subscribe((event) => {
       if (event instanceof NavigationEnd) {
        this.atualizaItensAtivos(this.router.url);
       }
    });
  }

  private atualizaItensAtivos(currentUrl: string) {
    const currentPath = this.router.parseUrl(currentUrl).root.children['primary']?.segments.map(it => it.path).join('/') ?? '';
    const fullPath = '/' + currentPath;

    this.menuItems.forEach(item => {
      item.active = fullPath === item.href;
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

  toggleCollapsed() {
    this.sideMenuService.collapsed.update(value => !value);
  }
}
