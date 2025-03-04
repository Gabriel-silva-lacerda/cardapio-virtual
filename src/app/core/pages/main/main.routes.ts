import { Routes } from '@angular/router';

export const mainRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../../pages/home/home-listar/home-listar.component').then(
        (m) => m.HomeListarComponent
      ),
  },
  {
    path: 'categoria/:type',
    loadComponent: () =>
      import(
        '../../../pages/selected-category/selected-category-list/selected-category-list.page'
      ).then((m) => m.SelectedCategoryListPage),
  },
  // {
  //   path: 'cardapio',
  //   loadComponent: () =>
  //     import('../../../pages/food-menu/food-menu-list/food-menu-list.page').then(
  //       (m) => m.FoodMenuListPage
  //     ),
  // },
  {
    path: 'cardapio/:id',
    loadComponent: () =>
      import('../../../pages/selected-food/selected-food-list/selected-food-list.page').then(
        (m) => m.SelectdFoodListPage
      ),
  },
];
