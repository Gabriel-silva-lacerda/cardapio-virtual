import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iCategory } from '../interfaces/category.interface';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseSupabaseService {
  protected override table = 'categories';

}
