import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-product-skeleton',
  imports: [],
  templateUrl: './product-skeleton.html',
  styleUrl: './product-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSkeleton {
  count = input(12);

  items = computed(() => Array.from({ length: this.count() }, (_, index) => index));
}
