import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/cart/cart.service';
import { CartBadge } from '../cart-badge/cart-badge';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CartBadge],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly cartCount = this.cartService.totalQuantity;
}
