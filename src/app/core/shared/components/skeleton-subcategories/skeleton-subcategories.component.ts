import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-subcategories',
  standalone: true,
  template: `
    <div class="animate-pulse">
      <!-- Sticky Skeleton -->
      <div class="sticky top-0 z-50 bg-white shadow-md">
        <div
          class="border border-gray-200 py-2 px-2 flex overflow-auto no-scrollbar"
        >
          @for (item of [1,2,3,4,5]; track $index) {
          <div class="px-4 py-2 mx-1 rounded bg-gray-200 w-24"></div>
          }
        </div>
      </div>

      <!-- Normal Skeleton -->
      <div
        class="border border-gray-200 py-2 px-2 mb-4 flex overflow-auto no-scrollbar"
      >
        @for (item of [1,2,3,4,5]; track $index) {
        <div class="px-4 py-2 mx-1 rounded bg-gray-200 w-24"></div>
        }
      </div>
    </div>
  `,
})
export class SkeletonSubcategoriesComponent {}
