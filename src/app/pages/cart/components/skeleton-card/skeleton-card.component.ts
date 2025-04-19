import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  imports: [],
  template: ` <div
    class="flex items-center gap-4 px-3 py-6 bg-white rounded-lg shadow-md border border-gray-200"
  >
    <div class="w-10 h-8 bg-gray-300 rounded-full"></div>
    <div class="flex flex-col gap-2 w-full">
      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      <div class="h-3 bg-gray-300 rounded w-1/2"></div>
      <div class="h-3 bg-gray-300 rounded w-1/2"></div>
      <div class="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>`,
  styleUrl: './skeleton-card.component.scss',
})
export class SkeletonCardComponent {}
