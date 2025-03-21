import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-button',
  imports: [NgClass, LoadingComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() customClass!: string;
  @Input() isLoading: boolean = false;
  @Input() isCanceled: boolean = false;
  @Input() label?: string;
  @Input() disabled: boolean = false;
}
