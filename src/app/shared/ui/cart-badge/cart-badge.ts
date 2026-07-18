import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-cart-badge',
  imports: [],
  templateUrl: './cart-badge.html',
  styleUrl: './cart-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartBadge {
  count = input.required<number>();
}
