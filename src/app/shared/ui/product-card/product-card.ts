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
  readonly product = input.required<Product>();
  readonly adding = input(false);

  readonly addToCart = output<number>();

  readonly hasDiscount = computed(() => this.product().discountPercentage > 0);

  readonly discountLabel = computed(() => `- ${this.product().discountPercentage.toFixed(2)}%`);

  readonly originalPrice = computed(() => this.formatPrice(this.product().price));

  readonly currentPrice = computed(() => {
    const product = this.product();

    if (!this.hasDiscount()) {
      return this.formatPrice(product.price);
    }

    const discountedPrice = product.price * (1 - product.discountPercentage / 100);

    return this.formatPrice(discountedPrice);
  });

  readonly reviewsCount = computed(() => this.product().reviews?.length ?? 0);

  readonly brand = computed(() => this.product().brand || 'N/A');

  readonly category = computed(() => this.formatCategory(this.product().category));

  readonly rating = computed(() => this.product().rating.toFixed(2));

  onAddToCart(): void {
    if (this.adding()) {
      return;
    }

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
