import { describe, it, expect } from 'vitest';
import { calculatePaginationTokens } from './paginateRange';

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

        const hasRightDots = tokens.some((t) => t.key === 'dots-right');
        const hasLeftDots = tokens.some((t) => t.key === 'dots-left');

        expect(hasRightDots).toBe(true);
        expect(hasLeftDots).toBe(false);
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

        const hasRightDots = tokens.some((t) => t.key === 'dots-right');
        const hasLeftDots = tokens.some((t) => t.key === 'dots-left');

        expect(hasRightDots).toBe(false);
        expect(hasLeftDots).toBe(true);
        expect(tokens[tokens.length - 1].page).toBe(20);
    });

    it('muestra elipsis en ambos lados cuando está en una página central', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 20,
            currentPage: 10,
            siblingCount: 1,
            boundaryCount: 1,
        });

        const hasRightDots = tokens.some((t) => t.key === 'dots-right');
        const hasLeftDots = tokens.some((t) => t.key === 'dots-left');

        expect(hasRightDots).toBe(true);
        expect(hasLeftDots).toBe(true);

        const activeToken = tokens.find((t) => t.isCurrent);
        expect(activeToken?.page).toBe(10);
    });

    it('soporta boundaryCount y siblingCount personalizados', () => {
        const tokens = calculatePaginationTokens({
            totalPages: 30,
            currentPage: 15,
            siblingCount: 2,
            boundaryCount: 2,
        });

        // Debe contener las primeras 2 páginas y las últimas 2 páginas
        expect(tokens.slice(0, 2).map((t) => t.page)).toEqual([1, 2]);
        expect(tokens.slice(-2).map((t) => t.page)).toEqual([29, 30]);

        // El centro debe tener 2 a la izquierda y 2 a la derecha de la 15: [13, 14, 15, 16, 17]
        const middlePages = tokens.filter((t) => t.type === 'page' && t.page! >= 13 && t.page! <= 17);
        expect(middlePages.map((t) => t.page)).toEqual([13, 14, 15, 16, 17]);
    });

    it('maneja valores extremos como totalPages <= 0 o currentPage fuera de rango sin romperse', () => {
        const tokensZero = calculatePaginationTokens({
            totalPages: 0,
            currentPage: -5,
        });
        expect(tokensZero.length).toBe(1);
        expect(tokensZero[0].page).toBe(1);

        const tokensOverflow = calculatePaginationTokens({
            totalPages: 10,
            currentPage: 999,
        });
        expect(tokensOverflow.find((t) => t.isCurrent)?.page).toBe(10);
    });
});