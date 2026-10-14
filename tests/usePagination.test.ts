import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { usePagination } from '../src/lib';

describe('usePagination hook', () => {
    it('calcula correctamente totalPages y estados iniciales', () => {
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 45,
                pageSize: 10,
                initialPage: 1,
            })
        );

        expect(result.current.totalPages).toBe(5);
        expect(result.current.isFirstPage).toBe(true);
        expect(result.current.hasPrevPage).toBe(false);
        expect(result.current.hasNextPage).toBe(true);
    });

    it('permite avanzar, retroceder y saltar de página', () => {
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 100,
                pageSize: 10,
                initialPage: 1,
            })
        );

        act(() => {
            result.current.nextPage();
        });
        expect(result.current.currentPage).toBe(2);

        act(() => {
            result.current.jumpPages(3);
        });
        expect(result.current.currentPage).toBe(5);

        act(() => {
            result.current.prevPage();
        });
        expect(result.current.currentPage).toBe(4);
    });

    it('responde a eventos de teclado', () => {
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 100,
                pageSize: 10,
                initialPage: 2,
            })
        );

        const containerProps = result.current.getContainerProps();

        act(() => {
            containerProps.onKeyDown?.({
                key: 'ArrowRight',
                preventDefault: vi.fn(),
                defaultPrevented: false,
            } as unknown as React.KeyboardEvent<HTMLElement>);
        });
        expect(result.current.currentPage).toBe(3);

        act(() => {
            containerProps.onKeyDown?.({
                key: 'Home',
                preventDefault: vi.fn(),
                defaultPrevented: false,
            } as unknown as React.KeyboardEvent<HTMLElement>);
        });
        expect(result.current.currentPage).toBe(1);
    });
});