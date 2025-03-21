import { CurrencyPipe, NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { iFood } from '@shared/interfaces/food.interface';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { iFoodDetails } from '@shared/interfaces/food-datails.interface';
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
import { LoadingService } from '@shared/services/loading/loading.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';

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
    LoadingComponent,
    IconButtonComponent
  ],
  templateUrl: './food-menu.component.html',
  styleUrl: './food-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodMenuComponent implements OnInit, OnChanges {
  @Input() food!: iFood;
  @Input() cartItem?: iCartItem;
  @Input() isInCart = false;
  @Input() showItem = false;
  @Output() editItem = new EventEmitter<number>();
  @Output() deleteItem = new EventEmitter<iFoodDetails>();

  private foodService = inject(FoodService);
  private cachedFoodDetails: iFoodDetails | null = null;
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService);

  public loadingService = inject(LoadingService);
  public tooltipMessage: string = '';
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  public isAdmin = this.authService.isAdmin;

  ngOnInit(): void {
    this.updateTooltipMessage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['food'] || changes['cartItem']) {
      this.cachedFoodDetails = null;
      this.updateTooltipMessage();
    }
  }

  get foodDetails(): iFoodDetails | null {
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

  public edit(foodId: number | undefined) {
    this.editItem.emit(foodId as number);
  }

  public remove(food: iFoodDetails | null) {
    this.deleteItem.emit(food as iFoodDetails);
  }
}
