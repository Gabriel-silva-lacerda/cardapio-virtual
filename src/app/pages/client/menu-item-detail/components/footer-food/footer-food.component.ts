import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { iFood } from '@shared/interfaces/food/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart/cart.service';
import {
  getCurrentDayOfWeek,
  getUnavailableItemMessage,
} from '@shared/utils/day.util';
import { DayOfWeek } from '@shared/enums/day-of-week.enum';
import { MatTooltip } from '@angular/material/tooltip';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-footer-food',
  imports: [CurrencyPipe, MatTooltip, NgClass],
  templateUrl: './footer-food.component.html',
  styleUrl: './footer-food.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterFoodComponent implements OnInit, OnChanges {
  @Input() food!: iFood | null;
  @Input() newItem = false;
  @Input() idItem!: string | null;

  private foodService = inject(FoodService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cartService = inject(CartService);
  public authService = inject(AuthService);
  public companyService = inject(CompanyService);
  public selectedAdditions = this.foodService.selectedAdditions;
  public observations = this.foodService.observations;
  public productCount = this.foodService.productCount;
  public totalPrice = signal(0);

  public tooltipMessage = '';

  constructor() {
    effect(() => {
      this.totalPrice.set(
        (this.food?.price || 0) * this.foodService.productCount() +
          this.foodService.totalAddition()
      );
    });
  }

  ngOnInit(): void {
    this.updateTooltipMessage();
  }

  ngOnChanges(): void {
    this.updateTotalPrice();
    this.updateTooltipMessage();
  }

  public increaseProductCount(): void {
    this.productCount.update((count) => count + 1);
    this.updateTotalPrice();
  }

  public decreaseProductCount(): void {
    if (this.productCount() > 1) {
      this.productCount.update((count) => count - 1);
      this.updateTotalPrice();
    }
  }

  private updateTotalPrice(): void {
    this.totalPrice.set(
      this.cartService.calculateTotalPrice(
        this.food,
        this.productCount(),
        this.selectedAdditions()
      )
    );
  }

  private updateTooltipMessage(): void {
    if (this.authService.isAdmin()) {
      this.tooltipMessage = 'Somente usuários podem adicionar no carrinho';
    } else {
      this.tooltipMessage =
        this.food?.day_of_week === getCurrentDayOfWeek()
          ? ''
          : getUnavailableItemMessage(this.food?.day_of_week);
    }
  }


  public getCurrentDayOfWeek(): DayOfWeek {
    return getCurrentDayOfWeek();
  }

  public addToCart(): void {
    if (!this.food) return;

    const cartItem = {
      id: this.newItem ? `cart-item-${Date.now()}` : this.idItem,
      food: this.food,
      quantity: this.productCount(),
      observations: this.observations(),
      extras: this.selectedAdditions(),
      totalPrice: this.totalPrice(),
    };

    this.cartService.addOrUpdateCartItem(cartItem, this.newItem, this.authService.currentUser()?.id);

    this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name, {
      positionClass: 'toast-top-left',
    });

    const targetRoute = this.newItem
      ? ['/app', this.companyService.companyName()]
      : ['/app', this.companyService.companyName(), 'cart'];

    this.router.navigate(targetRoute);
  }
}
