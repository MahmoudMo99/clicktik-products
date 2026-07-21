import { HttpErrorResponse } from '@angular/common/http';

import { ProductsState } from '../models/products-page.models';

export function getProductsErrorState(error: unknown): ProductsState {
  return {
    status: 'error',
    message: getProductsErrorMessage(error),
  };
}

function getProductsErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return 'Network error. Please check your connection.';
  }

  return 'Could not load products. Please try again.';
}
