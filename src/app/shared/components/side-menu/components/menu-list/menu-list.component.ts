import { CompanyService } from '@shared/services/company/company.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
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
  @Output() itemSelected = new EventEmitter<void>();

  public sideMenuService = inject(SideMenuService);
  public companyService = inject(CompanyService);
}
