import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { iFood } from '@shared/interfaces/food.interface';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { FoodDetails } from '@shared/interfaces/food-datails.interface';
import { DayOfWeek } from '@shared/enums/day-of-week.enum';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DayOfWeekTranslatePipe } from 'src/app/widget/pipes/day-of-week-translate.pipe';
import {
  getCurrentDayOfWeek,
  getUnavailableItemMessage,
} from '@shared/utils/day.utils';
import { FoodService } from '@shared/services/food/food.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-food-menu',
  imports: [
    CurrencyPipe,
    NgClass,
    NgIf,
    MatTooltipModule,
    DayOfWeekTranslatePipe,
    MatSnackBarModule,
    RouterLink,
    LoadingComponent
  ],
  templateUrl: './food-menu.component.html',
  styleUrl: './food-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodMenuComponent implements OnInit, OnChanges {
  @Input() food!: iFood;
  @Input() cartItem?: iCartItem;
  @Input() isInCart = false;

  private foodService = inject(FoodService);
  private cachedFoodDetails: FoodDetails | null = null;
  private localStorageService = inject(LocalStorageService);

  public tooltipMessage: string = '';
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  ngOnInit(): void {
    this.updateTooltipMessage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['food'] || changes['cartItem']) {
      this.cachedFoodDetails = null;
      this.updateTooltipMessage();
    }
  }

  get foodDetails(): FoodDetails | null {
    if (!this.cachedFoodDetails) {
      const foodData = this.cartItem ? this.cartItem.food : this.food;
      this.cachedFoodDetails = this.foodService.getFoodDetails(
        foodData,
        this.cartItem
      );
    }
    return this.cachedFoodDetails;
  }

  public getCurrentDayOfWeek(): DayOfWeek {
    return getCurrentDayOfWeek();
  }

  public getDayClass(dayOfWeek: DayOfWeek | undefined): string {
    return dayOfWeek === this.getCurrentDayOfWeek()
      ? 'text-green-500'
      : 'text-yellow-500';
  }

  private updateTooltipMessage(): void {
    this.tooltipMessage =
      this.foodDetails?.day_of_week === this.getCurrentDayOfWeek()
        ? ''
        : getUnavailableItemMessage(this.foodDetails?.day_of_week);
  }
}
