import { TestBed } from '@angular/core/testing';

import { DeliveryFeeService } from './delivery-fee.service';

describe('DeliveryFeeService', () => {
  let service: DeliveryFeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryFeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
