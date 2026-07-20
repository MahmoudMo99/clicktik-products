import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

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

  readonly discountLabel = computed(() => `- ${this.product().discountPercentage.toFixed(2)}%`);

  readonly originalPrice = computed(() => this.formatPrice(this.product().price));

  readonly reviewsCount = computed(() => this.product().reviews?.length ?? 0);

  readonly currentPrice = computed(() => {
    const product = this.product();

    if (!product.discountPercentage) {
      return this.formatPrice(product.price);
    }

    const discountedPrice = product.price * (1 - product.discountPercentage / 100);

    return this.formatPrice(discountedPrice);
  });

  readonly brand = computed(() => this.product().brand || 'N/A');

  readonly category = computed(() => this.formatCategory(this.product().category));

  readonly rating = computed(() => this.product().rating.toFixed(2));

  onAddToCart(): void {
    this.addToCart.emit(this.product().id);
  }

  private formatPrice(price: number): string {
    return Number.isInteger(price) ? String(price) : price.toFixed(2);
  }

  private formatCategory(category: string): string {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
