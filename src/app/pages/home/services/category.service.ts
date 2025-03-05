import { Injectable } from '@angular/core';
import { BaseService } from '@shared/services/base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService {
  constructor() {
    super('categories')
  }
}
