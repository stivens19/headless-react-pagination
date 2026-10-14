import { useCallback, useState, useEffect } from 'react';
import { usePagination } from './usePagination';
import type { UseUrlPaginationOptions, UsePaginationReturn } from '../types';

export const useUrlPagination = ({
    pageParamName = 'page',
    historyMethod = 'push',
    onPageChange,
    ...options
}: UseUrlPaginationOptions): UsePaginationReturn => {
    const readPageFromUrl = useCallback((): number => {
        if (typeof window === 'undefined') return 1;
        const params = new URLSearchParams(window.location.search);
        const parsed = parseInt(params.get(pageParamName) || '1', 10);
        return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }, [pageParamName]);

    const [urlPage, setUrlPage] = useState<number>(() => readPageFromUrl());

    useEffect(() => {
        const handlePopState = () => {
            const pageFromHistory = readPageFromUrl();
            setUrlPage(pageFromHistory);
            onPageChange?.(pageFromHistory);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [readPageFromUrl, onPageChange]);

    const handlePageChange = useCallback(
        (nextPage: number) => {
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                if (nextPage === 1) {
                    url.searchParams.delete(pageParamName);
                } else {
                    url.searchParams.set(pageParamName, String(nextPage));
                }

                if (historyMethod === 'push') {
                    window.history.pushState({}, '', url.toString());
                } else {
                    window.history.replaceState({}, '', url.toString());
                }
            }

            setUrlPage(nextPage);
            onPageChange?.(nextPage);
        },
        [pageParamName, historyMethod, onPageChange]
    );

    return usePagination({
        ...options,
        currentPage: urlPage,
        onChange: handlePageChange,
    });
};