import { describe, it, expect } from 'vitest';
import { calculatePaginationTokens } from '../src/lib';

describe('calculatePaginationTokens', () => {
    it('retorna todas las páginas sin elipsis cuando el total es menor a la ranura máxima', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 5,
            currentPage: 1,
            siblingCount: 1,
            boundaryCount: 1,
        });

        expect(tokens.map((t) => t.page)).toEqual([1, 2, 3, 4, 5]);
        expect(tokens.some((t) => t.type === 'dots')).toBe(false);
    });

    it('muestra elipsis a la derecha cuando está en la primera página', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 20,
            currentPage: 1,
            siblingCount: 1,
            boundaryCount: 1,
        });

        expect(tokens.some((t) => t.key === 'dots-right')).toBe(true);
        expect(tokens.some((t) => t.key === 'dots-left')).toBe(false);
        expect(tokens[0].page).toBe(1);
        expect(tokens[tokens.length - 1].page).toBe(20);
    });

    it('muestra elipsis a la izquierda cuando está en la última página', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 20,
            currentPage: 20,
            siblingCount: 1,
            boundaryCount: 1,
        });

        expect(tokens.some((t) => t.key === 'dots-right')).toBe(false);
        expect(tokens.some((t) => t.key === 'dots-left')).toBe(true);
        expect(tokens[tokens.length - 1].page).toBe(20);
    });

    it('muestra elipsis en ambos lados cuando está en una página central', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 20,
            currentPage: 10,
            siblingCount: 1,
            boundaryCount: 1,
        });

        expect(tokens.some((t) => t.key === 'dots-right')).toBe(true);
        expect(tokens.some((t) => t.key === 'dots-left')).toBe(true);
    });
});