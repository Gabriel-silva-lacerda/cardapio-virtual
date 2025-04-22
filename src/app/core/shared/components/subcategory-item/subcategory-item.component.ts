import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subcategory-item',
  imports: [],
  template: `<div
    class="mt-4 mb-3 py-2 border-y"
    [id]="'subcat-' + subcategory.id"
  >
    <span class="text-gray-600 text-md font-medium">
      {{ subcategory.name }}
    </span>
  </div>`,
})
export class SubcategoryItemComponent {
  @Input() subcategory: { id: string; name: string } = { id: '', name: '' };
}
