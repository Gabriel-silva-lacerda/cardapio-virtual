import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAddressDialogComponent } from './payment-address-dialog.component';

describe('PaymentAddressDialogComponent', () => {
  let component: PaymentAddressDialogComponent;
  let fixture: ComponentFixture<PaymentAddressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAddressDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentAddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
