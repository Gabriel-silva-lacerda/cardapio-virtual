import { TestBed } from '@angular/core/testing';

import { FoodEditViewService } from './food-edit-view.service';

describe('FoodEditViewService', () => {
  let service: FoodEditViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodEditViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
