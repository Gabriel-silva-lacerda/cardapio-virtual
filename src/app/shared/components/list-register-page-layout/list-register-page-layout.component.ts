import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';

@Component({
  selector: 'app-list-register-page-layout',
  imports: [LoadingComponent, SearchInputComponent],
  templateUrl: './list-register-page-layout.component.html',
  styleUrl: './list-register-page-layout.component.scss'
})
export class ListRegisterPageLayoutComponent {
  @Input() title: string = '';
  @Input() addLabel: string = 'Adicionar';
  @Input() showAddButton: boolean = true;
  @Input() isLoading: boolean = false;
  @Input() hasMore: boolean = false;

  @Output() add = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  public isOpen = signal(false);


}
