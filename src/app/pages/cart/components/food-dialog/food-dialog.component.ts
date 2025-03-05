import { CurrencyPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-food-dialog',
  imports: [CurrencyPipe],
  templateUrl: './food-dialog.component.html',
  styleUrl: './food-dialog.component.scss'
})
export class FoodDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

}
