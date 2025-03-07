import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { iCategory } from '../../interfaces/category.interface';

@Component({
  selector: 'app-category',
  imports: [RouterLink],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  @Input() category!: iCategory;


  trackById(index: number, item: iCategory): number {
    return item.id;
  }
}
