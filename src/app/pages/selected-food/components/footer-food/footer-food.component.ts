import { CurrencyPipe, NgFor } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer-food',
  imports: [CurrencyPipe],
  templateUrl: './footer-food.component.html',
  styleUrl: './footer-food.component.scss'
})
export class FooterFoodComponent {
  @Input() food!: any; // Recebe o produto
  public totalPrice: number = 0;  // Preço total do produto + adicionais
  public productCount: number = 1;  // Quantidade de produtos no carrinho
  public selectedAdditions: { [key: string]: number } = {}; // Armazena os itens adicionais
  private router = inject(Router)

  // Inicializa o totalPrice com o preço da comida ao carregar o componente
  ngOnInit() {
    this.totalPrice = this.food?.price || 0;  // Preço inicial do produto
  }

  // Função para aumentar a quantidade do produto
  public increaseProductCount(): void {
    this.productCount++;
    this.updateTotalPrice();  // Atualiza o total
  }

  // Função para diminuir a quantidade do produto
  public decreaseProductCount(): void {
    if (this.productCount > 1) {
      this.productCount--;
      this.updateTotalPrice();  // Atualiza o total
    }
  }

  // Atualiza o total considerando o preço do produto e o número de unidades
  private updateTotalPrice(): void {
    this.totalPrice = (this.food?.price || 0) * this.productCount; // Total do produto (sem os adicionais)
  }

  // Atualiza o preço total incluindo os adicionais
  public updateAdditionsTotal(data: { totalAdditions: number, selectedAdditions: any }): void {
    this.selectedAdditions = data.selectedAdditions;
    this.totalPrice = (this.food?.price || 0) * this.productCount + data.totalAdditions; // Adicionando os adicionais
  }

  public addToCart(): void {
    // Cria um objeto para o item do carrinho
    const cartItem = {
      food: this.food,
      quantity: this.productCount,
      totalPrice: this.totalPrice,
      additions: this.selectedAdditions,  // Adiciona os itens adicionais
    };

    // Recupera o carrinho do localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Adiciona o novo item no carrinho
    cart.push(cartItem);

    // Atualiza o carrinho no localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    console.log('Produto adicionado ao carrinho:', cartItem);
    this.router.navigate(['/cart']); // Substitua '/cart' pela rota do seu carrinho

  }
}
