import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { iFood } from '@shared/interfaces/food.interface';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { FoodDetails } from '@shared/interfaces/food-datails.interface';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-food-menu',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './food-menu.component.html',
  styleUrl: './food-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodMenuComponent implements OnChanges {
  @Input() food!: iFood;
  @Input() cartItem?: iCartItem;
  @Input() isInCart = false;

  private cachedFoodDetails: FoodDetails | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['food'] || changes['cartItem'] ) {
      this.cachedFoodDetails = null;
    }
  }

  get foodDetails() {
    if (this.cachedFoodDetails) {
      return this.cachedFoodDetails;
    }

    const foodData =  this.cartItem ? this.cartItem.food : this.food;
    if (!foodData) return null;

    this.cachedFoodDetails = {
      id: foodData.id,
      name: foodData.name,
      description: foodData.description,
      price: foodData.price,
      imageUrl: foodData.image_url,
      quantity: this.cartItem ? this.cartItem.quantity : undefined,
      totalPrice: this.cartItem ? this.cartItem.totalPrice : undefined
    };

    return this.cachedFoodDetails;
  }

}
