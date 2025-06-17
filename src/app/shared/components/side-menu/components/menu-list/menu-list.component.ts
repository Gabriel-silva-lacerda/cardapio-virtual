import { Component, inject, Input } from '@angular/core';
import { iMenuItem } from './menu-list.interface';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { SideMenuService } from '../../services/side-menu.service';

@Component({
  selector: 'app-menu-list',
  imports: [RouterLink, NgClass, NgIf],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent {
  @Input() menuItems: iMenuItem[] = [];
  @Input() public collapsed = false;
  public sideMenuService = inject(SideMenuService);
}
