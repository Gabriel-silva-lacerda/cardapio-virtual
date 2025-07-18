import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonComponent } from '@shared/components/icon-button/icon-button.component';

@Component({
  selector: 'app-category-header',
  imports: [IconButtonComponent, NgClass],
  templateUrl: './category-header.component.html',
  styleUrl: './category-header.component.scss'
})
export class CategoryHeaderComponent {
  @Input() name = '';
  @Input() hasSubcategory = false;
  @Input() expanded = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
  @Output() onDuplicate = new EventEmitter<void>();
}
