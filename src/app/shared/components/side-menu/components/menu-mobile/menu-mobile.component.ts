import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuListComponent } from '../menu-list/menu-list.component';
import { NgClass } from '@angular/common';
import { iMenuItem } from '../menu-list/menu-list.interface';

@Component({
  selector: 'app-menu-mobile',
  imports: [MenuListComponent, NgClass],
  templateUrl: './menu-mobile.component.html',
  styleUrl: './menu-mobile.component.scss'
})
export class MenuMobileComponent {
  @Input() menuItems: iMenuItem[] = [];
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
}
