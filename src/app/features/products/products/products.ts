import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { catchError, distinctUntilChanged, map, of, shareReplay, startWith, switchMap } from 'rxjs';

import { CartService } from '../../../core/cart/cart.service';
import type { Product, ProductsResponse } from '../../../core/models/product.models';
import { ProductsService } from '../../../core/products/products.service';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductSkeleton } from '../../../shared/ui/product-skeleton/product-skeleton';
import type { SelectOption } from '../../../shared/ui/select/select';
import { Select } from '../../../shared/ui/select/select';
import type { ProductsPageQuery, ProductsState } from '../models/products-page.models';
import {
  DEFAULT_PRODUCTS_QUERY,
  PRODUCTS_LOADING_STATE,
  PRODUCTS_PAGE_SIZE,
} from '../models/products-page.models';
import { getProductsErrorState } from '../utils/products-errors';
import { formatCategoryName } from '../utils/products-formatters';
import { isSameProductsQuery, toProductsPageQuery } from '../utils/products-query';

@Component({
  selector: 'app-products',
  imports: [Select, ProductCard, Pagination, EmptyState, ProductSkeleton],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);

  readonly addingProductId = this.cartService.addingProductId;
  readonly cartErrorMessage = signal('');

  private readonly query$ = this.route.queryParamMap.pipe(
    map(toProductsPageQuery),
    distinctUntilChanged(isSameProductsQuery),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  readonly query = toSignal(this.query$, {
    initialValue: DEFAULT_PRODUCTS_QUERY,
  });

  readonly categories = toSignal(
    this.productsService.getCategoriesWithCounts().pipe(catchError(() => of([]))),
    {
      initialValue: [],
    },
  );

  readonly allProductsCount = toSignal(
    this.productsService.getProducts({ page: 1, limit: 1 }).pipe(
      map((response) => response.total),
      catchError(() => of(0)),
    ),
    {
      initialValue: 0,
    },
  );

  readonly productsState = toSignal(
    this.query$.pipe(
      switchMap((query) =>
        this.getProductsByQuery(query).pipe(
          map((response): ProductsState => ({
            status: 'success',
            response,
          })),
          startWith(PRODUCTS_LOADING_STATE),
          catchError((error: unknown) => of(getProductsErrorState(error))),
        ),
      ),
    ),
    {
      initialValue: PRODUCTS_LOADING_STATE,
    },
  );

  readonly selectedCategoryName = computed(() => {
    const categorySlug = this.query().category;

    if (!categorySlug) {
      return '';
    }

    return (
      this.categories().find((category) => category.slug === categorySlug)?.name ??
      formatCategoryName(categorySlug)
    );
  });

  readonly pageTitle = computed(() => {
    const search = this.query().search;
    const category = this.query().category;

    if (search) {
      return search;
    }

    if (category) {
      return this.selectedCategoryName();
    }

    return 'Products';
  });

  readonly breadcrumbItems = computed(() => {
    const title = this.pageTitle();

    return title === 'Products' ? ['Home', 'Products'] : ['Home', 'Products', title];
  });

  readonly productsFoundLabel = computed(() => {
    const total = this.totalProducts();
    const label = total === 1 ? 'Product Found' : 'Products Found';

    return `(${total}) ${label}`;
  });

  readonly categoryOptions = computed<SelectOption[]>(() => [
    {
      label: `All (${this.allProductsCount()})`,
      value: '',
    },
    ...this.categories().map((category) => ({
      label: `${category.name} (${category.count})`,
      value: category.slug,
    })),
  ]);

  readonly products = computed<Product[]>(() => {
    const state = this.productsState();

    return state.status === 'success' ? state.response.products : [];
  });

  readonly totalProducts = computed(() => {
    const state = this.productsState();

    return state.status === 'success' ? state.response.total : 0;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalProducts() / PRODUCTS_PAGE_SIZE)),
  );

  selectCategory(categorySlug: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: categorySlug || null,
        search: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.query().page) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page,
      },
      queryParamsHandling: 'merge',
    });
  }

  addProductToCart(productId: number): void {
    this.cartErrorMessage.set('');

    this.cartService
      .addProduct(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.cartErrorMessage.set('Could not add product to cart.');
        },
      });
  }

  private getProductsByQuery(query: ProductsPageQuery): Observable<ProductsResponse> {
    if (query.search) {
      return this.productsService.searchProducts(query.search, query);
    }

    if (query.category) {
      return this.productsService.getProductsByCategory(query.category, query);
    }

    return this.productsService.getProducts(query);
  }
}
