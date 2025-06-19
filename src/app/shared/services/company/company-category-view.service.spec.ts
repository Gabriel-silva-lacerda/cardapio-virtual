import { TestBed } from '@angular/core/testing';

import { CompanyCategoryViewService } from './company-category-view.service';

describe('CompanyCategoryViewService', () => {
  let service: CompanyCategoryViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyCategoryViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
