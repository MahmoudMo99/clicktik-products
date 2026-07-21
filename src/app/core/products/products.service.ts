import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { API_BASE_URL } from '../http/api.config';
import {
  ProductCategory,
  ProductCategoryWithCount,
  ProductsQuery,
  ProductsResponse,
} from '../models/product.models';

const CATEGORY_COUNT_QUERY: ProductsQuery = {
  page: 1,
  limit: 1,
};

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${API_BASE_URL}/products`;

  private readonly categoriesWithCounts$ = this.loadCategoriesWithCounts().pipe(
    shareReplay({
      bufferSize: 1,
      refCount: false,
    }),
  );

  getProducts(query: ProductsQuery): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(this.productsUrl, {
      params: this.getPaginationParams(query),
    });
  }

  searchProducts(searchTerm: string, query: ProductsQuery): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.productsUrl}/search`, {
      params: {
        ...this.getPaginationParams(query),
        q: searchTerm.trim(),
      },
    });
  }

  getProductsByCategory(categorySlug: string, query: ProductsQuery): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(
      `${this.productsUrl}/category/${encodeURIComponent(categorySlug)}`,
      {
        params: this.getPaginationParams(query),
      },
    );
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.productsUrl}/categories`);
  }

  getCategoriesWithCounts(): Observable<ProductCategoryWithCount[]> {
    return this.categoriesWithCounts$;
  }

  private loadCategoriesWithCounts(): Observable<ProductCategoryWithCount[]> {
    return this.getCategories().pipe(
      switchMap((categories) => {
        if (!categories.length) {
          return of([]);
        }

        return forkJoin(
          categories.map((category) =>
            this.getProductsByCategory(category.slug, CATEGORY_COUNT_QUERY).pipe(
              map((response) => ({
                ...category,
                count: response.total,
              })),
              catchError(() =>
                of({
                  ...category,
                  count: 0,
                }),
              ),
            ),
          ),
        );
      }),
      catchError(() => of([])),
    );
  }

  private getPaginationParams(query: ProductsQuery): Record<string, number> {
    const page = Math.max(query.page, 1);
    const limit = Math.max(query.limit, 1);

    return {
      limit,
      skip: (page - 1) * limit,
    };
  }
}
