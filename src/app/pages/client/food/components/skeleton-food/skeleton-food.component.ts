import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-food',
  imports: [NgClass],
  templateUrl: './skeleton-food.component.html',
})
export class SkeletonFoodComponent {
  @Input() showTitle = true;
  @Input() customClass = '';
}
