import { Component, Input } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-icon-button',
  imports: [LoadingComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent {
  @Input() icon?: string; // Ícone dinâmico (FontAwesome, Material, etc.)
  @Input() isLoading: boolean = false; // Controle de loading opcional
  @Input() disabled: boolean = false; // Controle de desabilitação
}
