import { FoodDetailsComponent } from './../components/food-details/food-details.component';
import { Component, inject } from '@angular/core';
import { fade } from '@shared/utils/animations.util';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-food-menu-list',
  imports: [FoodDetailsComponent],
  templateUrl: './selected-food-list.page.html',
  styleUrl: './selected-food-list.page.scss',
  animations: [fade],
})
export class SelectdFoodListPage {
  private route = inject(ActivatedRoute);


  public food!: any;

  public additionalItems: { [key: string]: { name: string; price: number }[] } = {
    marmita: [
      { name: 'Arroz extra', price: 2.50 },
      { name: 'Feijão extra', price: 2.00 },
      { name: 'Salada', price: 3.00 },
    ],
    sobremesa: [
      { name: 'Calda de chocolate', price: 1.50 },
      { name: 'Granulado', price: 1.00 },
      { name: 'Frutas', price: 3.50 },
    ],
    bebida: [
      { name: 'Gelo extra', price: 0.50 },
      { name: 'Limão', price: 1.00 },
      { name: 'Canudo', price: 0.30 },
    ],
  };


  public foods = [
    {
      id: 1,
      name: 'Marmita de Frango',
      description: 'Frango grelhado com arroz e feijão',
      price: 15.99,
      imgUrl: 'assets/images/image1.webp',
      type: 'marmita'
    },
    {
      id: 2,
      name: 'Sobremesa de Chocolate',
      description: 'Chocolate com frutas vermelhas',
      price: 8.5,
      imgUrl: 'assets/images/image2.webp',
      type: 'sobremesa'
    },
    {
      id: 3,
      name: 'Coca-cola',
      description: 'Coca-cola de 300ml',
      price: 22.0,
      imgUrl: 'assets/images/image3.jpg',
      type: 'bebida'
    },

  ];

  public id!: string | null;

  constructor() {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');

      if (this.id) {
        this.getFood();
      }
    });
  }

  getFood() {
    this.food = this.foods.find(
      (food) => food.id == (this.id as unknown as number)
    );
  }
}
