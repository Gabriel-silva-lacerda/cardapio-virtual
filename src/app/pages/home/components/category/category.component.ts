import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iCategory } from '../../interfaces/category.interface';

@Component({
  selector: 'app-category',
  imports: [RouterLink],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  @Input() category!: iCategory;
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  trackById(index: number, item: iCategory): number {
    return item.id;
  }
}
