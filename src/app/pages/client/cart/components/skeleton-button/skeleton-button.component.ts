import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-button',
  imports: [],
  template: ` <div class="flex items-center gap-2 mb-2">
    <div class="w-1/2 h-10 bg-gray-300 rounded animate-pulse"></div>
    <div class="w-1/2 h-10 bg-gray-300 rounded animate-pulse"></div>
  </div>`,
})
export class SkeletonButtonComponent {}
