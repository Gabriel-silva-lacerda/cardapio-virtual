import { Injectable } from "@angular/core";
import { iCategory } from "@shared/interfaces/category/category.interface";
import { IFoodAdmin } from "@shared/interfaces/food/food.interface";
import { iSubcategory } from "@shared/interfaces/subcategory/subcategory.interface";
import { FoodApi } from "@shared/api/food/food.api";
import { ImageService } from "@shared/services/image/image.service";
import { getImageUrl } from "@shared/utils/get-image/get-image.utits";
import { CategoryService } from "src/app/pages/client/home/services/category.service";
import { SubcategoryService } from "src/app/pages/client/home/services/subcategory.service";
import { getBaseName, getNextCopyName } from "../utils/base-name-util";

@Injectable({ providedIn: 'root' })
export class DuplicationService {
  constructor(
    private categoryService: CategoryService,
    private subcategoryService: SubcategoryService,
    private foodApi: FoodApi,
  ) {}

  async duplicateCategoryAndSubcategories(
    category: iCategory,
    subcategories: iSubcategory[],
    companyId: string,
    foodsByContainer: Record<string, any[]>
  ): Promise<iCategory> {
    const newCategory = await this.createDuplicatedItem(category, companyId, 'category');

    for (const sub of subcategories) {
      const newSub = await this.createDuplicatedItem(sub, companyId, 'subcategory', newCategory.id);
      await this.duplicateFoodsForContainer(
        sub.id!,
        newCategory.id!,
        newSub.id!,
        companyId,
        'subcategory_id',
        foodsByContainer
      );
    }

    if (!category.has_subcategory) {
      await this.duplicateFoodsForContainer(
        category.id!,
        newCategory.id!,
        null,
        companyId,
        'category_id',
        foodsByContainer
      );
    }

    return newCategory;
  }

  private async createDuplicatedItem<T extends iCategory | iSubcategory>(
    original: T,
    companyId: string,
    type: 'category' | 'subcategory',
    newCategoryId?: string
  ): Promise<T> {
    const baseName = getBaseName(original.name);
    const allNames = [] as any; // Essa parte pode ser passada como argumento opcional também
    const newName = getNextCopyName(baseName, allNames);

    if (type === 'category') {
      return this.categoryService.insert<iCategory>({
        name: newName,
        company_id: companyId,
        has_subcategory: (original as iCategory).has_subcategory
      }) as Promise<T>;
    } else {
      return this.subcategoryService.insert<iSubcategory>({
        name: newName,
        category_id: newCategoryId!,
        company_id: companyId
      }) as Promise<T>;
    }
  }

  private async duplicateFoodsForContainer(
    originalContainerId: string,
    newCategoryId: string,
    newSubcategoryId: string | null,
    companyId: string,
    filterKey: 'category_id' | 'subcategory_id',
    foodsByContainer: Record<string, any[]>
  ): Promise<void> {
    const originalFoods = foodsByContainer[originalContainerId] ?? [];
    const namesInUse = new Set<string>();

    for (const food of originalFoods) {
      const baseName = getBaseName(food.name);
      const newName = getNextCopyName(baseName, Array.from(namesInUse));
      namesInUse.add(newName);

      await this.foodApi.insert({
        name: newName,
        description: food.description,
        price: food.price,
        image_url: food.image_url,
        company_id: companyId,
        category_id: newCategoryId,
        ...(newSubcategoryId && { subcategory_id: newSubcategoryId })
      });
    }
  }
}

