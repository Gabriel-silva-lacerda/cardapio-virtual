import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-categories',
  imports: [],
  templateUrl: './skeleton-categories.component.html',
})
export class SkeletonCategoriesComponent {
  @Input() customClass!: string;
}
