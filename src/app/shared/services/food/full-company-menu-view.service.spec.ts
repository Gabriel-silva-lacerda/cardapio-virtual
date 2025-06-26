import { TestBed } from '@angular/core/testing';

import { FullCompanyMenuViewService } from '../company/full-menu-view.service';

describe('FullCompanyMenuViewService', () => {
  let service: FullCompanyMenuViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullCompanyMenuViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
