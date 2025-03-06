import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { iFood } from '@shared/interfaces/food.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer-food',
  imports: [CurrencyPipe],
  templateUrl: './footer-food.component.html',
  styleUrl: './footer-food.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterFoodComponent {
  @Input() food!: iFood | null;
  @Input() selectedAdditions = signal<{ [key: number]: { id: number; name: string; price: number; quantity: number } }>({});
  @Input() observations = '';
  @Input() totalPrice = signal(0);
  @Input() productCount = signal(1);
  @Input() newItem = false;
  @Input() idItem!: string | null;

  private router = inject(Router);
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['food']?.currentValue) {
      this.updateTotalPrice();
    }
  }

  // Função para aumentar a quantidade do produto
  public increaseProductCount(): void {
    this.productCount.update(count => count + 1);
    this.updateTotalPrice(); // Atualiza o total
  }

  // Função para diminuir a quantidade do produto
  public decreaseProductCount(): void {
    if (this.productCount() > 1) {
      this.productCount.update(count => count - 1);
      this.updateTotalPrice();
    }
  }

  // Atualiza o total considerando o preço do produto e o número de unidades
  private updateTotalPrice(): void {
    this.totalPrice.set((this.food?.price || 0) * this.productCount() + this.getAdditionsTotal());
  }

  // Método para calcular o total dos adicionais
  private getAdditionsTotal(): number {
    return Object.values(this.selectedAdditions()).reduce((sum, item) => {
      return sum + (item.quantity * item.price); // Calcula o total com base na quantidade e preço de cada adicional
    }, 0);
  }

  // Atualiza o preço total incluindo os adicionais
  public updateAdditionsTotal(data: { totalAdditions: number, selectedAdditions: any, observations: any }): void {
    this.selectedAdditions.set(data.selectedAdditions); // Atualiza os adicionais
    this.observations = data.observations; // Atualiza as observações
    console.log(data);

    this.totalPrice.set((this.food?.price || 0) * this.productCount() + data.totalAdditions); // Atualiza o total incluindo adicionais
  }

  public addToCart(): void {
    const cartItemId = this.newItem ? `cart-item-${Date.now()}` : this.idItem;

    const cartItem = {
      id: cartItemId,
      food: this.food,
      quantity: this.productCount(),
      observations: this.observations,
      extras: this.selectedAdditions(),
      totalPrice: this.totalPrice(),
    };

    const currentCart = this.localStorageService.getItem<any[]>('cart') || [];
    const existingItemIndex = currentCart.findIndex(item => item.food.id === this.food?.id);

    if (!this.newItem && existingItemIndex !== -1) {
      // Editando um item já existente
      currentCart[existingItemIndex] = {
        ...currentCart[existingItemIndex], // Mantém dados antigos
        ...cartItem, // Sobrescreve com novos valores
      };

      this.toastr.success('Produto atualizado: ', this.food?.name)
      this.router.navigate(['/cart']);
    } else if (existingItemIndex !== -1) {
      // Item já existe, atualiza quantidade, preço total e adicionais
      this.updateExistingItem(currentCart[existingItemIndex], cartItem);
      this.router.navigate(['/']);
      this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name)
    } else {
      // Novo item, adiciona ao carrinho
      currentCart.push(cartItem);
      this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name)
      this.router.navigate(['/']);
    }

    this.localStorageService.setItem('cart', currentCart);
  }

  private updateExistingItem(existingItem: any, newItem: any): void {
    existingItem.quantity += newItem.quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.food.price;

    // Atualiza os adicionais, somando quantidades
    Object.keys(newItem.extras).forEach(key => {
      if (existingItem.extras[key]) {
        existingItem.extras[key].quantity += newItem.extras[key].quantity;
      } else {
        existingItem.extras[key] = newItem.extras[key];
      }
    });

    // Concatena observações se existirem
    if (newItem.observations) {
      existingItem.observations = existingItem.observations
        ? `${existingItem.observations} | ${newItem.observations}`
        : newItem.observations;
    }
  }
}
