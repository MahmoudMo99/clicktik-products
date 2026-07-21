import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/cart/cart.service';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly cartCount = this.cartService.totalQuantity;

  private readonly searchFromUrl = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('search')?.trim() ?? '')),
    {
      initialValue: '',
    },
  );

  readonly headerSearch = linkedSignal(() => this.searchFromUrl());

  constructor() {
    this.handleHeaderSearchChanges();
  }

  updateHeaderSearch(search: string): void {
    this.headerSearch.set(search);
  }

  logout(): void {
    this.cartService.clear();
    this.authService.logout();
    this.headerSearch.set('');

    void this.router.navigate(['/login']);
  }

  private handleHeaderSearchChanges(): void {
    toObservable(this.headerSearch)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search) => {
        if (!this.shouldNavigateToSearch(search)) {
          return;
        }

        this.navigateToSearchResults(search);
      });
  }

  private shouldNavigateToSearch(search: string): boolean {
    return this.isAuthenticated() && search !== this.searchFromUrl();
  }

  private navigateToSearchResults(search: string): void {
    void this.router.navigate(['/products'], {
      queryParams: {
        search: search || null,
        category: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }
}
