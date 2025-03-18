import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { iFood } from '@shared/interfaces/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../home/services/category.service';
import { iCategory } from '../../home/interfaces/category.interface';
import { KeyValuePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AddEditItemDialogComponent } from '../components/add-edit-item-dialog/add-edit-item-dialog.component';
import { DeleteItemDialogComponent } from '../components/delete-item-dialog/delete-item-dialog.component';

@Component({
  selector: 'app-food-page',
  imports: [FoodMenuComponent, HeaderPageComponent, KeyValuePipe],
  templateUrl: './food.page.html',
  styleUrl: './food.page.scss',
  animations: [fade],
})
export class FoodPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  public foods = signal<iFood[] | null>(null);
  public title = signal<string>('');
  public id!: string | null;
  public groupedFoods = signal<Record<string, iFood[]>>({});

  ngOnInit(): void {
    this.getAllFoods();
    // this.removeFood();
    this.addFood();
  }

  private async getAllFoods(): Promise<void> {
    this.id = await firstValueFrom(this.route.paramMap).then((params) =>
      params.get('id')
    );

    if (this.id) this.getFoodsByCategory(+this.id);
    else {
      const groupedFoods = await this.foodService.getAllFoodsGroupedByCategory();
      this.groupedFoods.set(groupedFoods);
      this.title.set('Cardápio')
    }
  }

  public async getFoodsByCategory(id: number) {
    const foods = await this.foodService.getFoodsByCategory(id);
    const category = await this.categoryService.getById<iCategory>('categories', id);

    if (!category) {
      console.error('Categoria não encontrada');
      return;
    }

    this.title.set(category.name);
    this.foods.set(foods);
  }

  public addFood() {
    const dialogRef = this.dialog.open(AddEditItemDialogComponent, {
      width: '400px',
      height: '800px'
    });

    dialogRef.afterClosed().subscribe(async (selectedPayment) => {
      if (selectedPayment) {
        this.getAllFoods();
      }
    });
  }

  public removeFood() {
    const dialogRef = this.dialog.open(DeleteItemDialogComponent, {
      width: '400px',
      height: '660px'
    });

    dialogRef.afterClosed().subscribe(async (selectedPayment) => {
      if (selectedPayment) {
        this.getAllFoods();
      }
    });
  }
}
