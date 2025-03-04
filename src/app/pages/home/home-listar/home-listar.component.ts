import { Component } from '@angular/core';
import { CategoryComponent } from '../components/category/category.component';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.util';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { SelectdFoodListPage } from '../../selected-food/selected-food-list/selected-food-list.page';

@Component({
  selector: 'app-home-listar',
  imports: [CategoryComponent, FoodMenuComponent, HeaderPageComponent, SelectdFoodListPage],
  templateUrl: './home-listar.component.html',
  styleUrl: './home-listar.component.scss',
  animations: [fade]
})
export class HomeListarComponent {
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
}
