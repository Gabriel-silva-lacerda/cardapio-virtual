import { Component } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-loading-screen',
  imports: [LoadingComponent],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
    >
      <app-loading />
    </div>
  `,
  styleUrls: ['./loading-screen.component.scss'],
})
export class LoadingScreenComponent {}
