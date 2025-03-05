import { CurrencyPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FoodDetailsComponent } from 'src/app/pages/selected-food/components/food-details/food-details.component';
import { FooterFoodComponent } from 'src/app/pages/selected-food/components/footer-food/footer-food.component';

@Component({
  selector: 'app-food-dialog',
  imports: [CurrencyPipe, FoodDetailsComponent, FooterFoodComponent],
  templateUrl: './food-dialog.component.html',
  styleUrl: './food-dialog.component.scss'
})
export class FoodDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.data);

  }

}
