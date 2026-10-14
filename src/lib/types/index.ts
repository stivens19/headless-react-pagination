import type React from 'react';

export type PaginationItemType = 'page' | 'dots' | 'prev' | 'next' | 'first' | 'last';

export interface PaginationToken {
    key: string;
    type: PaginationItemType;
    page: number | null;
    isCurrent: boolean;
    disabled: boolean;
}

export interface RangeOptions {
    totalPages: number;
    currentPage: number;
    siblingCount?: number;
    boundaryCount?: number;
}

export interface UsePaginationOptions {
    totalItems: number;
    pageSize?: number;
    initialPage?: number;
    currentPage?: number;
    siblingCount?: number;
    boundaryCount?: number;
    onChange?: (page: number) => void;
}

export interface ButtonPropOverrides extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export interface UsePaginationReturn {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
    tokens: PaginationToken[];
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
    jumpPages: (offset: number) => void;

    getContainerProps: (props?: React.HTMLAttributes<HTMLElement>) => React.HTMLAttributes<HTMLElement>;
    getItemProps: (token: PaginationToken, overrides?: ButtonPropOverrides) => React.ButtonHTMLAttributes<HTMLButtonElement>;
    getPrevProps: (overrides?: ButtonPropOverrides) => React.ButtonHTMLAttributes<HTMLButtonElement>;
    getNextProps: (overrides?: ButtonPropOverrides) => React.ButtonHTMLAttributes<HTMLButtonElement>;
    getFirstProps: (overrides?: ButtonPropOverrides) => React.ButtonHTMLAttributes<HTMLButtonElement>;
    getLastProps: (overrides?: ButtonPropOverrides) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export interface UseUrlPaginationOptions extends Omit<UsePaginationOptions, 'currentPage' | 'initialPage' | 'onChange'> {
    pageParamName?: string;
    historyMethod?: 'push' | 'replace';
    onPageChange?: (page: number) => void;
}