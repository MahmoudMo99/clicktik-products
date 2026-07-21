import { ParamMap } from '@angular/router';

import { PRODUCTS_PAGE_SIZE, ProductsPageQuery } from '../models/products-page.models';

export function toProductsPageQuery(params: ParamMap): ProductsPageQuery {
  return {
    page: getValidPage(params.get('page')),
    limit: PRODUCTS_PAGE_SIZE,
    search: params.get('search')?.trim() ?? '',
    category: params.get('category')?.trim() ?? '',
  };
}

export function isSameProductsQuery(
  previous: ProductsPageQuery,
  current: ProductsPageQuery,
): boolean {
  return (
    previous.page === current.page &&
    previous.search === current.search &&
    previous.category === current.category
  );
}

function getValidPage(page: string | null): number {
  const parsedPage = Number(page);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}
