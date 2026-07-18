import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';

import { Product, ProductsResponse } from '../../../core/models/product.models';
import { ProductsService } from '../../../core/products/products.service';
import { Input } from '../../../shared/ui/input/input';
import { ProductCard } from '../../../shared/ui/product-card/product-card';

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
  imports: [Input, ProductCard],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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

  readonly searchTerm = linkedSignal(() => this.query().search);

  readonly categories = toSignal(
    this.productsService.getCategories().pipe(catchError(() => of([]))),
    {
      initialValue: [],
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

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  constructor() {
    toObservable(this.searchTerm)
      .pipe(
        debounceTime(400),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search) => {
        if (search === this.query().search) {
          return;
        }

        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            search: search || null,
            category: null,
            page: 1,
          },
          queryParamsHandling: 'merge',
        });
      });
  }

  selectCategory(categorySlug: string): void {
    this.searchTerm.set('');

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
    console.log('Add product to cart:', productId);
  }
}
