import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../core/models/product.models';
import { Button } from '../button/button';

@Component({
  selector: 'app-product-card',
  imports: [Button],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();
  adding = input(false);

  addToCart = output<number>();

  onAddToCart(): void {
    this.addToCart.emit(this.product().id);
  }
}
