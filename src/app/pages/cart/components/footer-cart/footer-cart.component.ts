import { CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';

@Component({
  selector: 'app-footer-cart',
  imports: [CurrencyPipe],
  templateUrl: './footer-cart.component.html',
  styleUrl: './footer-cart.component.scss'
})
export class FooterCartComponent implements OnInit {
  @Input() carts!: iCartItem[];
  public total!: number;

  ngOnInit(): void {
    this.total = this.carts.reduce((accum, item) => accum + item.totalPrice, 0);
  }
}
