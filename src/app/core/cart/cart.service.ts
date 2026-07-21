import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../http/api.config';
import {
  AddToCartRequest,
  CartProduct,
  CartRequestProduct,
  CartResponse,
} from '../models/cart.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly quantitiesState = signal<Record<number, number>>({});
  private readonly addingProductIdState = signal<number | null>(null);

  readonly addingProductId = this.addingProductIdState.asReadonly();

  readonly totalProducts = computed(() => Object.keys(this.quantitiesState()).length);

  readonly totalQuantity = computed(() =>
    Object.values(this.quantitiesState()).reduce((total, quantity) => total + quantity, 0),
  );

  addProduct(productId: number): Observable<CartResponse> {
    const user = this.authService.user();

    if (!user) {
      return throwError(() => new Error('User must be authenticated.'));
    }

    const previousQuantities = this.quantitiesState();
    const nextQuantities = this.getNextQuantities(previousQuantities, productId);

    this.quantitiesState.set(nextQuantities);
    this.addingProductIdState.set(productId);

    return this.http
      .post<CartResponse>(
        `${API_BASE_URL}/carts/add`,
        this.getAddToCartRequest(user.id, nextQuantities),
      )
      .pipe(
        tap((cart) => this.quantitiesState.set(this.getQuantitiesFromProducts(cart.products))),
        catchError((error: unknown) => {
          this.quantitiesState.set(previousQuantities);
          return throwError(() => error);
        }),
        finalize(() => this.addingProductIdState.set(null)),
      );
  }

  clear(): void {
    this.quantitiesState.set({});
  }

  private getNextQuantities(
    currentQuantities: Record<number, number>,
    productId: number,
  ): Record<number, number> {
    return {
      ...currentQuantities,
      [productId]: (currentQuantities[productId] ?? 0) + 1,
    };
  }

  private getAddToCartRequest(
    userId: number,
    quantities: Record<number, number>,
  ): AddToCartRequest {
    return {
      userId,
      products: this.getRequestProducts(quantities),
    };
  }

  private getRequestProducts(quantities: Record<number, number>): CartRequestProduct[] {
    return Object.entries(quantities).map(([id, quantity]) => ({
      id: Number(id),
      quantity,
    }));
  }

  private getQuantitiesFromProducts(products: CartProduct[]): Record<number, number> {
    return products.reduce<Record<number, number>>((quantities, product) => {
      quantities[product.id] = product.quantity;
      return quantities;
    }, {});
  }
}
