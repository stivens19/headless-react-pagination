import React, { useMemo, useState, useCallback } from 'react';
import { calculatePaginationTokens } from '../utils/paginateRange';
import type {
    UsePaginationOptions,
    UsePaginationReturn,
    PaginationToken,
    ButtonPropOverrides,
} from '../types';

export const usePagination = ({
    totalItems,
    pageSize = 10,
    initialPage = 1,
    currentPage: controlledPage,
    siblingCount = 1,
    boundaryCount = 1,
    onChange,
}: UsePaginationOptions): UsePaginationReturn => {
    const [internalPage, setInternalPage] = useState<number>(initialPage);

    const isControlled = controlledPage !== undefined;
    const activePage = isControlled ? controlledPage : internalPage;

    const totalPages = useMemo(() => {
        const pages = Math.ceil(Math.max(0, totalItems) / Math.max(1, pageSize));
        return Math.max(1, pages);
    }, [totalItems, pageSize]);

    const clampedPage = useMemo(() => {
        return Math.min(Math.max(1, activePage), totalPages);
    }, [activePage, totalPages]);

    const setPage = useCallback(
        (page: number) => {
            const targetPage = Math.min(Math.max(1, page), totalPages);
            if (targetPage === clampedPage) return;

            if (!isControlled) {
                setInternalPage(targetPage);
            }
            onChange?.(targetPage);
        },
        [totalPages, clampedPage, isControlled, onChange]
    );

    const hasPrevPage = clampedPage > 1;
    const hasNextPage = clampedPage < totalPages;

    const tokens = useMemo(() => {
        return calculatePaginationTokens({
            totalPages,
            currentPage: clampedPage,
            siblingCount,
            boundaryCount,
        });
    }, [totalPages, clampedPage, siblingCount, boundaryCount]);

    const nextPage = useCallback(() => setPage(clampedPage + 1), [setPage, clampedPage]);
    const prevPage = useCallback(() => setPage(clampedPage - 1), [setPage, clampedPage]);
    const firstPage = useCallback(() => setPage(1), [setPage]);
    const lastPage = useCallback(() => setPage(totalPages), [setPage, totalPages]);
    const jumpPages = useCallback(
        (offset: number) => setPage(clampedPage + offset),
        [setPage, clampedPage]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLElement>) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (hasNextPage) nextPage();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (hasPrevPage) prevPage();
            } else if (e.key === 'Home') {
                e.preventDefault();
                firstPage();
            } else if (e.key === 'End') {
                e.preventDefault();
                lastPage();
            }
        },
        [hasNextPage, hasPrevPage, nextPage, prevPage, firstPage, lastPage]
    );

    const getContainerProps = useCallback(
        (props: React.HTMLAttributes<HTMLElement> = {}): React.HTMLAttributes<HTMLElement> => ({
            role: 'navigation',
            'aria-label': props['aria-label'] || 'Paginación',
            tabIndex: props.tabIndex ?? 0,
            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                props.onKeyDown?.(e);
                if (!e.defaultPrevented) {
                    handleKeyDown(e);
                }
            },
            ...props,
        }),
        [handleKeyDown]
    );

    const getItemProps = useCallback(
        (token: PaginationToken, overrides: ButtonPropOverrides = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => {
            if (token.type === 'dots') {
                return {
                    'aria-hidden': true,
                    disabled: true,
                    tabIndex: -1,
                    ...overrides,
                };
            }

            return {
                type: 'button',
                'aria-current': token.isCurrent ? 'page' : undefined,
                'aria-label': overrides['aria-label'] || `Página ${token.page}`,
                disabled: overrides.disabled || token.disabled,
                onClick: (e) => {
                    overrides.onClick?.(e);
                    if (!e.defaultPrevented && token.page !== null) {
                        setPage(token.page);
                    }
                },
                onKeyDown: (e) => {
                    overrides.onKeyDown?.(e);
                    if (!e.defaultPrevented) {
                        handleKeyDown(e);
                    }
                },
                ...overrides,
            };
        },
        [setPage, handleKeyDown]
    );

    const getPrevProps = useCallback(
        (overrides: ButtonPropOverrides = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
            type: 'button',
            'aria-label': overrides['aria-label'] || 'Página anterior',
            disabled: overrides.disabled !== undefined ? overrides.disabled : !hasPrevPage,
            onClick: (e) => {
                overrides.onClick?.(e);
                if (!e.defaultPrevented) prevPage();
            },
            onKeyDown: (e) => {
                overrides.onKeyDown?.(e);
                if (!e.defaultPrevented) handleKeyDown(e);
            },
            ...overrides,
        }),
        [hasPrevPage, prevPage, handleKeyDown]
    );

    const getNextProps = useCallback(
        (overrides: ButtonPropOverrides = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
            type: 'button',
            'aria-label': overrides['aria-label'] || 'Página siguiente',
            disabled: overrides.disabled !== undefined ? overrides.disabled : !hasNextPage,
            onClick: (e) => {
                overrides.onClick?.(e);
                if (!e.defaultPrevented) nextPage();
            },
            onKeyDown: (e) => {
                overrides.onKeyDown?.(e);
                if (!e.defaultPrevented) handleKeyDown(e);
            },
            ...overrides,
        }),
        [hasNextPage, nextPage, handleKeyDown]
    );

    const getFirstProps = useCallback(
        (overrides: ButtonPropOverrides = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
            type: 'button',
            'aria-label': overrides['aria-label'] || 'Primera página',
            disabled: overrides.disabled !== undefined ? overrides.disabled : clampedPage === 1,
            onClick: (e) => {
                overrides.onClick?.(e);
                if (!e.defaultPrevented) firstPage();
            },
            onKeyDown: (e) => {
                overrides.onKeyDown?.(e);
                if (!e.defaultPrevented) handleKeyDown(e);
            },
            ...overrides,
        }),
        [clampedPage, firstPage, handleKeyDown]
    );

    const getLastProps = useCallback(
        (overrides: ButtonPropOverrides = {}): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
            type: 'button',
            'aria-label': overrides['aria-label'] || 'Última página',
            disabled: overrides.disabled !== undefined ? overrides.disabled : clampedPage === totalPages,
            onClick: (e) => {
                overrides.onClick?.(e);
                if (!e.defaultPrevented) lastPage();
            },
            onKeyDown: (e) => {
                overrides.onKeyDown?.(e);
                if (!e.defaultPrevented) handleKeyDown(e);
            },
            ...overrides,
        }),
        [clampedPage, totalPages, lastPage, handleKeyDown]
    );

    return {
        currentPage: clampedPage,
        totalPages,
        pageSize,
        totalItems,
        hasPrevPage,
        hasNextPage,
        isFirstPage: clampedPage === 1,
        isLastPage: clampedPage === totalPages,
        tokens,
        goToPage: setPage,
        nextPage,
        prevPage,
        firstPage,
        lastPage,
        jumpPages,
        getContainerProps,
        getItemProps,
        getPrevProps,
        getNextProps,
        getFirstProps,
        getLastProps,
    };
};