import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  @Input() placeholder: string = 'Pesquisar...';
  @Output() searchChange = new EventEmitter<string>(); // Emite eventos

  public searchQuery = signal('');

  onSearchChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchQuery.set(inputValue);
    this.searchChange.emit(inputValue); // Emite a busca para o componente pai
  }
}
