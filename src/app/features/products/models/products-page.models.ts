import { ProductsQuery, ProductsResponse } from '../../../core/models/product.models';

export const PRODUCTS_PAGE_SIZE = 6;

export interface ProductsPageQuery extends ProductsQuery {
  search: string;
  category: string;
}

export type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; response: ProductsResponse }
  | { status: 'error'; message: string };

export const DEFAULT_PRODUCTS_QUERY: ProductsPageQuery = {
  page: 1,
  limit: PRODUCTS_PAGE_SIZE,
  search: '',
  category: '',
};

export const PRODUCTS_LOADING_STATE: ProductsState = {
  status: 'loading',
};
