import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../http/api.config';
import { CartRequestProduct, CartResponse } from '../models/cart.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly quantities = signal<Record<number, number>>({});

  readonly addingProductId = signal<number | null>(null);

  readonly totalProducts = computed(() => Object.keys(this.quantities()).length);

  readonly totalQuantity = computed(() =>
    Object.values(this.quantities()).reduce((total, quantity) => total + quantity, 0),
  );

  addProduct(productId: number): Observable<CartResponse> {
    const user = this.authService.user();

    if (!user) {
      return throwError(() => new Error('User must be authenticated.'));
    }

    const nextQuantities = {
      ...this.quantities(),
      [productId]: (this.quantities()[productId] ?? 0) + 1,
    };

    this.addingProductId.set(productId);

    return this.http
      .post<CartResponse>(`${API_BASE_URL}/carts/add`, {
        userId: user.id,
        products: this.getRequestProducts(nextQuantities),
      })
      .pipe(
        tap(() => this.quantities.set(nextQuantities)),
        finalize(() => this.addingProductId.set(null)),
      );
  }

  clear(): void {
    this.quantities.set({});
  }

  private getRequestProducts(quantities: Record<number, number>): CartRequestProduct[] {
    return Object.entries(quantities).map(([id, quantity]) => ({
      id: Number(id),
      quantity,
    }));
  }
}
