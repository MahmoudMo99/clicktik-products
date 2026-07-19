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
import { catchError, distinctUntilChanged, map, Observable, of, startWith, switchMap } from 'rxjs';

import { CartService } from '../../../core/cart/cart.service';
import { Product, ProductsResponse } from '../../../core/models/product.models';
import { ProductsService } from '../../../core/products/products.service';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { Pagination } from '../../../shared/ui/pagination/pagination';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductSkeleton } from '../../../shared/ui/product-skeleton/product-skeleton';
import { Select, SelectOption } from '../../../shared/ui/select/select';

const PAGE_SIZE = 12;

interface ProductsPageQuery {
  page: number;
  limit: number;
  search: string;
  category: string;
}

type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; response: ProductsResponse }
  | { status: 'error'; message: string };

const DEFAULT_QUERY: ProductsPageQuery = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  category: '',
};

const LOADING_STATE: ProductsState = {
  status: 'loading',
};

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

  readonly pageTitle = computed(() => {
    const search = this.query().search;
    const category = this.query().category;

    if (search) {
      return search;
    }

    if (category) {
      return this.formatCategoryName(category);
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

  private readonly query$ = this.route.queryParamMap.pipe(
    map((params): ProductsPageQuery => ({
      page: this.getValidPage(params.get('page')),
      limit: PAGE_SIZE,
      search: params.get('search')?.trim() ?? '',
      category: params.get('category')?.trim() ?? '',
    })),
    distinctUntilChanged(
      (previous, current) =>
        previous.page === current.page &&
        previous.search === current.search &&
        previous.category === current.category,
    ),
  );

  readonly query = toSignal(this.query$, {
    initialValue: DEFAULT_QUERY,
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
          startWith(LOADING_STATE),
          catchError(() =>
            of({
              status: 'error',
              message: 'Could not load products. Please try again.',
            } satisfies ProductsState),
          ),
        ),
      ),
    ),
    {
      initialValue: LOADING_STATE,
    },
  );

  readonly products = computed<Product[]>(() => {
    const state = this.productsState();

    return state.status === 'success' ? state.response.products : [];
  });

  readonly totalProducts = computed(() => {
    const state = this.productsState();

    return state.status === 'success' ? state.response.total : 0;
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalProducts() / PAGE_SIZE)));

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

  private getProductsByQuery(query: ProductsPageQuery): Observable<ProductsResponse> {
    if (query.search) {
      return this.productsService.searchProducts(query.search, query);
    }

    if (query.category) {
      return this.productsService.getProductsByCategory(query.category, query);
    }

    return this.productsService.getProducts(query);
  }

  private getValidPage(page: string | null): number {
    const parsedPage = Number(page);

    return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
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

  private formatCategoryName(category: string): string {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
