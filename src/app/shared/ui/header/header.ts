import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartBadge } from '../cart-badge/cart-badge';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CartBadge],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly isAuthenticated = input.required<boolean>();
  readonly cartCount = input.required<number>();
  readonly searchValue = input<string>('');

  readonly searchValueChange = output<string>();
  readonly logoutClicked = output<void>();

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchValueChange.emit(input.value);
  }

  onLogoutClick(): void {
    this.logoutClicked.emit();
  }
}
