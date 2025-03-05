import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterFoodComponent } from './footer-food.component';

describe('FooterFoodComponent', () => {
  let component: FooterFoodComponent;
  let fixture: ComponentFixture<FooterFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterFoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
