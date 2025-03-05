import { CurrencyPipe } from '@angular/common';
import { Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { iFood } from '@shared/interfaces/food.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-footer-food',
  imports: [CurrencyPipe],
  templateUrl: './footer-food.component.html',
  styleUrl: './footer-food.component.scss'
})
export class FooterFoodComponent {
  @Input() food!: iFood | null;
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);

  public totalPrice = signal(0);
  public productCount = signal(1);
  public selectedAdditions = signal<{ [key: number]: { id: number; name: string; price: number; quantity: number } }>({});
  public observations!: string;

  // Inicializa o totalPrice com o preço da comida ao carregar o componente
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
    this.totalPrice.set((this.food?.price || 0) * this.productCount() + data.totalAdditions); // Atualiza o total incluindo adicionais
  }

  public addToCart(): void {
    // Cria um objeto para o item do carrinho
    const cartItem = {
      food: this.food,
      quantity: this.productCount(),
      observations: this.observations,
      extras: this.selectedAdditions(),
      totalPrice: this.totalPrice(),
    };

    // Recupera o carrinho do localStorage
    // let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // // Adiciona o novo item no carrinho
    // cart.push(cartItem);

    // // Atualiza o carrinho no localStorage
    // localStorage.setItem('cart', JSON.stringify(cart));
    const currentCart = this.localStorageService.getItem<any[]>('cart') || [];
    this.localStorageService.setItem('cart', [...currentCart, cartItem]);

    console.log('Produto adicionado ao carrinho:', cartItem);
    this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name)
    this.router.navigate(['/']); // Substitua '/cart' pela rota do seu carrinho
  }
}
