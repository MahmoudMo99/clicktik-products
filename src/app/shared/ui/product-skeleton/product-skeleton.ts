import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-product-skeleton',
  templateUrl: './product-skeleton.html',
  styleUrl: './product-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSkeleton {
  readonly count = input(6);

  readonly items = computed(() =>
    Array.from({ length: Math.max(this.count(), 0) }, (_, index) => index),
  );
}
