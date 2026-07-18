import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../http/api.config';
import { ProductCategory, ProductsQuery, ProductsResponse } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly productsUrl = `${API_BASE_URL}/products`;

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
    return this.http.get<ProductsResponse>(`${this.productsUrl}/category/${categorySlug}`, {
      params: this.getPaginationParams(query),
    });
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.productsUrl}/categories`);
  }

  private getPaginationParams(query: ProductsQuery): Record<string, number> {
    return {
      limit: query.limit,
      skip: (query.page - 1) * query.limit,
    };
  }
}
