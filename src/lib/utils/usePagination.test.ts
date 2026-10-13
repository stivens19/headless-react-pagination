import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { usePagination } from '../hooks/usePagination';


describe('usePagination hook', () => {
    it('calcula correctamente totalPages y estados de primera/última página', () => {
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
            result.current.jumpPages(3); // 2 + 3 = 5
        });
        expect(result.current.currentPage).toBe(5);

        act(() => {
            result.current.prevPage();
        });
        expect(result.current.currentPage).toBe(4);

        act(() => {
            result.current.lastPage();
        });
        expect(result.current.currentPage).toBe(10);
        expect(result.current.isLastPage).toBe(true);
        expect(result.current.hasNextPage).toBe(false);
    });

    it('ejecuta onChange cuando cambia la página', () => {
        const handleChange = vi.fn();
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 50,
                pageSize: 10,
                onChange: handleChange,
            })
        );

        act(() => {
            result.current.goToPage(3);
        });

        expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('getItemProps aplica aria-current="page" únicamente en la página activa', () => {
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 30,
                pageSize: 10,
                initialPage: 2,
            })
        );

        const activeToken = result.current.tokens.find((t) => t.page === 2)!;
        const inactiveToken = result.current.tokens.find((t) => t.page === 1)!;

        const activeProps = result.current.getItemProps(activeToken);
        const inactiveProps = result.current.getItemProps(inactiveToken);

        expect(activeProps['aria-current']).toBe('page');
        expect(inactiveProps['aria-current']).toBeUndefined();
    });

    it('responde a eventos de teclado (ArrowRight, ArrowLeft, Home, End)', () => {
        const { result } = renderHook(() =>
            usePagination({
                totalItems: 100,
                pageSize: 10,
                initialPage: 2,
            })
        );

        const containerProps = result.current.getContainerProps();

        // Simular flecha derecha (ArrowRight -> página 3)
        act(() => {
            containerProps.onKeyDown?.({
                key: 'ArrowRight',
                preventDefault: vi.fn(),
                defaultPrevented: false,
            } as unknown as React.KeyboardEvent<HTMLElement>);
        });
        expect(result.current.currentPage).toBe(3);

        // Simular Home (Home -> página 1)
        act(() => {
            containerProps.onKeyDown?.({
                key: 'Home',
                preventDefault: vi.fn(),
                defaultPrevented: false,
            } as unknown as React.KeyboardEvent<HTMLElement>);
        });
        expect(result.current.currentPage).toBe(1);

        // Simular End (End -> página 10)
        act(() => {
            containerProps.onKeyDown?.({
                key: 'End',
                preventDefault: vi.fn(),
                defaultPrevented: false,
            } as unknown as React.KeyboardEvent<HTMLElement>);
        });
        expect(result.current.currentPage).toBe(10);
    });
});