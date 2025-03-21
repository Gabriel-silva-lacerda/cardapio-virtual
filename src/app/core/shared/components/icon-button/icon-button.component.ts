import { Component, Input } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-icon-button',
  imports: [LoadingComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() icon?: string;
  @Input() isLoading: boolean = false;
  @Input() disabled: boolean = false;
}
