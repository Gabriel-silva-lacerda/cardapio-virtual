import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.util';

@Component({
  selector: 'app-selected-category-list',
  imports: [FoodMenuComponent, HeaderPageComponent],
  templateUrl: './selected-category-list.page.html',
  styleUrl: './selected-category-list.page.scss',
  animations: [fade]
})
export class SelectedCategoryListPage {
  private route = inject(ActivatedRoute);

  public type!: string | null;
  public food!: any;
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
  ]

  public title!: string;

  ngOnInit(): void {
    this.getParam();
  }

  private getParam(): void {
    this.route.paramMap.subscribe(params => {
      this.type = params.get('type');
      if (this.type) {
        this.getFood();
      }
    });
  }

  public getFood(): void {
    this.food = this.foods.find(
      (food) => food.type === (this.type as unknown as string)
    );

    if (this.food) {
      this.title =
        this.food.type.charAt(0).toUpperCase() + this.food.type.slice(1) + 's';
    }
  }

}
