import { Component, Input } from '@angular/core';
import { iMenuItem } from './menu-list.interface';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu-list',
  imports: [RouterLink, NgClass],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent {
  @Input() menuItems: iMenuItem[] = [];

}
