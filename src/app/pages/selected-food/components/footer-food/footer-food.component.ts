import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, signal, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() textButton = 'Carrinho'
  @Input() public totalPrice = signal(0);

  private router = inject(Router);
  private toastr = inject(ToastrService);
  private localStorageService = inject(LocalStorageService);

  @Input() isEdit = false;
  @Input() public productCount = signal(1);

  @Input() idItem!: string | null;
  // Inicializa o totalPrice com o preço da comida ao carregar o componente
  ngOnChanges(changes: SimpleChanges) {
    if (changes['food']?.currentValue) {
      console.log(this.totalPrice());

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
    let cartItemId: string | null;

    if (this.isEdit) {
      cartItemId = this.idItem; // Se for edição, mantemos o mesmo id
    } else {
      cartItemId = `cart-item-${Date.now()}`; // Se for criação, geramos um novo id
    }

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

    console.log(currentCart);
    console.log(this.isEdit);

  if (this.isEdit) {
    console.log("teste");
      // Variável para verificar se estamos em modo de edição
    // const existingItemIndex = currentCart.findIndex(item => item.id === this.food?.id);  // `editingItemId` pode ser o id do item que estamos editando

    if (existingItemIndex !== -1) {
      // Substitui o item atual com as novas informações de edição
      currentCart[existingItemIndex] = {
        ...currentCart[existingItemIndex], // Mantém o item antigo
        quantity: this.productCount(), // Atualiza a quantidade
        extras: this.selectedAdditions(), // Atualiza os adicionais
        totalPrice: this.totalPrice(), // Atualiza o preço total
        observations: this.observations, // Atualiza as observações
      };
    }

    console.log("Atualizado", currentCart);
    this.localStorageService.setItem('cart', currentCart);
    this.router.navigate(['/cart']);

  } else {  // Se não estamos em modo de edição, adiciona o item ao carrinho normalmente
    const existingItemIndex = currentCart.findIndex(item => item.food.id === this.food?.id);

    if (existingItemIndex !== -1) {
      // Atualiza a quantidade do item existente e o totalPrice
      currentCart[existingItemIndex].quantity += this.productCount();
      currentCart[existingItemIndex].totalPrice = currentCart[existingItemIndex].quantity * currentCart[existingItemIndex].food.price;

      // Mescla os adicionais
      const existingAdditions = currentCart[existingItemIndex].extras || {};
      const updatedAdditions = this.selectedAdditions();
      Object.keys(updatedAdditions).forEach(key => {
        existingAdditions[key] = updatedAdditions[key as any];
      });
      currentCart[existingItemIndex].extras = existingAdditions;
      currentCart[existingItemIndex].observations = this.observations;

    } else {
      // Se o item não existir, adiciona o novo item
      currentCart.push(cartItem);
    }

    this.localStorageService.setItem('cart', currentCart);

    console.log('Produto adicionado ao carrinho:', cartItem);
    this.toastr.success('Produto adicionado ao carrinho: ', this.food?.name)
    this.router.navigate(['/']);
  }
}}
