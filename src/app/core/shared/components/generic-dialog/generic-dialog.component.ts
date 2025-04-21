import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-dialog',
  imports: [],
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.scss',
})
export class GenericDialogComponent {
  @Input() title: string = '';
  @Input() customClass: string = '';
  @Input() isCutomHeader: boolean = false;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
