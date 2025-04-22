import { TestBed } from '@angular/core/testing';

import { SubcategoryScrollService } from './subcategory-scroll/subcategory-scroll.service';

describe('SubcategoryScrollService', () => {
  let service: SubcategoryScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubcategoryScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
