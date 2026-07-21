import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-cart-badge',
  templateUrl: './cart-badge.html',
  styleUrl: './cart-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartBadge {
  readonly count = input.required<number>();

  readonly displayCount = computed(() => (this.count() > 99 ? '99+' : String(this.count())));

  readonly ariaLabel = computed(() => {
    const count = this.count();
    const label = count === 1 ? 'product' : 'products';

    return `Cart contains ${count} ${label}`;
  });
}
