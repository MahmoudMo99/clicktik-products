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
  isAuthenticated = input.required<boolean>();
  cartCount = input.required<number>();
  searchValue = input<string>('');

  searchValueChange = output<string>();
  logoutClicked = output<void>();

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchValueChange.emit(input.value);
  }

  onLogoutClick(): void {
    this.logoutClicked.emit();
  }
}
