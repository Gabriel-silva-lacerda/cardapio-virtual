import { FoodDetailsComponent } from './../components/food-details/food-details.component';
import { Component, inject, signal } from '@angular/core';
import { fade } from '@shared/utils/animations.util';
import { ActivatedRoute } from '@angular/router';
import { FooterFoodComponent } from "../components/footer-food/footer-food.component";
import { FoodService } from '@shared/services/food/food.service';
import { iFood } from '@shared/interfaces/food.interface';
import { ExtraService } from '../services/extra.service';
import { iExtra } from '../interfaces/extra.interface';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-food-menu-list',
  imports: [FoodDetailsComponent, FooterFoodComponent, FormsModule],
  templateUrl: './selected-food-list.page.html',
  styleUrl: './selected-food-list.page.scss',
  animations: [fade],
})
export class SelectdFoodListPage {
  private route = inject(ActivatedRoute);
  private foodService = inject(FoodService);
  private extraService = inject(ExtraService);
  private toastr = inject(ToastrService);

  public food = signal<iFood | null>(null);
  public extras = signal<iExtra[]>([]);

  public id!: string | null;

  ngOnInit() {
    this.getRouteId();
  }

  private async getRouteId(): Promise<void> {
    this.id = await firstValueFrom(this.route.paramMap).then(params => params.get('id'));

    if (this.id)
      this.loadFoodAndExtras(this.id);
  }

  private async loadFoodAndExtras(foodId: string) {
    try {
      const [food, extras] = await Promise.all([
        this.foodService.getFoodById(foodId),
        this.extraService.getExtrasByFoodId(foodId),
      ]);

      this.food.set(food);
      this.extras.set(extras);
    } catch (error) {
      this.toastr.error('Erro ao carregar comida e extras:', 'Erro');
    }
  }

  onSubmit() {

  }
}
