import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, Input, OnInit, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { iFood } from '@shared/interfaces/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart/cart.service';

@Component({
  selector: 'app-footer-food',
  imports: [CurrencyPipe],
  templateUrl: './footer-food.component.html',
  styleUrl: './footer-food.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterFoodComponent {
  @Input() food!: iFood | null;
  @Input() newItem = false;
  @Input() idItem!: string | null;

  private foodService = inject(FoodService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cartService = inject(CartService);

  public selectedAdditions = this.foodService.selectedAdditions;
  public observations = this.foodService.observations;
  public productCount = this.foodService.productCount;
  public totalPrice = signal(0);

  constructor() {
    effect(() => {
      this.totalPrice.set((this.food?.price || 0) * this.foodService.productCount() + this.foodService.totalAddition());
    });
  }

  ngOnChanges(): void {
    this.updateTotalPrice();
  }

  public increaseProductCount(): void {
    this.productCount.update(count => count + 1);
    this.updateTotalPrice();
  }

  public decreaseProductCount(): void {
    if (this.productCount() > 1) {
      this.productCount.update(count => count - 1);
      this.updateTotalPrice();
    }
  }

  private updateTotalPrice(): void {
    this.totalPrice.set(
      this.cartService.calculateTotalPrice(this.food, this.productCount(), this.selectedAdditions())
    );
  }

  public addToCart(): void {
    if(!this.food) return;

    const cartItem = {
      id: this.newItem ? `cart-item-${Date.now()}` : this.idItem,
      food: this.food ,
      quantity: this.productCount(),
      observations: this.observations(),
      extras: this.selectedAdditions(),
      totalPrice: this.totalPrice(),
    };

    this.cartService.addOrUpdateCartItem(cartItem, this.newItem);
    this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name);
    this.router.navigate([this.newItem ? '/' : '/cart']);
  }
}
