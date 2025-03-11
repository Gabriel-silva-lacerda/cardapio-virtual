import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { iCategory } from '../../interfaces/category.interface';
import { CompanyService } from '@shared/services/company/company.service';

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
