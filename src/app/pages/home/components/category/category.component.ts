import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-category',
  imports: [RouterLink],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  items = [
    { id: 1, name: 'Marmitas', icon: 'fa-solid fa-utensils', type: 'marmita' },
    { id: 2, name: 'Sobremesas', icon: 'fa-solid fa-stroopwafel', type: 'sobremesa' },
    { id: 3, name: 'Bebidas', icon: 'fa-solid fa-martini-glass', type: 'bebida' },
  ];


  trackById(index: number, item: any): number {
    return item.id;
  }
}
