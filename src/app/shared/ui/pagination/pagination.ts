import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

type PaginationItem =
  | {
      type: 'page';
      page: number;
      id: string;
    }
  | {
      type: 'ellipsis';
      id: string;
    };

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();

  readonly pageChange = output<number>();

  readonly items = computed<PaginationItem[]>(() => {
    const totalPages = Math.max(this.totalPages(), 1);
    const currentPage = this.currentPage();

    if (totalPages <= 5) {
      return createPageItems(Array.from({ length: totalPages }, (_, index) => index + 1));
    }

    const pages = new Set<number>([
      1,
      2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      totalPages - 1,
      totalPages,
    ]);

    const validPages = [...pages]
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((first, second) => first - second);

    return validPages.reduce<PaginationItem[]>((items, page, index) => {
      const previousPage = validPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        items.push({
          type: 'ellipsis',
          id: `ellipsis-${previousPage}-${page}`,
        });
      }

      items.push({
        type: 'page',
        page,
        id: `page-${page}`,
      });

      return items;
    }, []);
  });

  readonly isFirstPage = computed(() => this.currentPage() <= 1);
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages());

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}

function createPageItems(pages: number[]): PaginationItem[] {
  return pages.map((page) => ({
    type: 'page',
    page,
    id: `page-${page}`,
  }));
}
