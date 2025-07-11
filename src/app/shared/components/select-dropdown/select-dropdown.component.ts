import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-dropdown',
  imports: [FormsModule],
  templateUrl: './select-dropdown.component.html',
  styleUrl: './select-dropdown.component.scss'
})
export class SelectDropdownComponent {
  @Input() items: { id: string; name: string }[] = [];
  @Input() selectedId: string | null = null;
  @Output() selectedIdChange = new EventEmitter<string>();
}
