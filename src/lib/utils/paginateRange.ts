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

const range = (start: number, end: number): number[] => {
    if (start > end) return [];
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
};

export const calculatePaginationTokens = ({
    totalPages,
    currentPage,
    siblingCount = 1,
    boundaryCount = 1,
}: RangeOptions): PaginationToken[] => {
    const safeTotalPages = Math.max(1, Math.floor(totalPages));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

    const totalSlots = boundaryCount * 2 + siblingCount * 2 + 3;

    if (safeTotalPages <= totalSlots) {
        return range(1, safeTotalPages).map((p) => ({
            key: `page-${p}`,
            type: 'page',
            page: p,
            isCurrent: p === safeCurrentPage,
            disabled: false,
        }));
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(
        safeCurrentPage + siblingCount,
        safeTotalPages - boundaryCount
    );

    const showLeftDots = leftSiblingIndex > boundaryCount + 2;
    const showRightDots = rightSiblingIndex < safeTotalPages - (boundaryCount + 1);

    const startPages = range(1, boundaryCount);
    const endPages = range(safeTotalPages - boundaryCount + 1, safeTotalPages);

    const tokens: PaginationToken[] = [];

    // Páginas iniciales fijas
    startPages.forEach((p) => {
        tokens.push({
            key: `page-${p}`,
            type: 'page',
            page: p,
            isCurrent: p === safeCurrentPage,
            disabled: false,
        });
    });

    // Zona intermedia izquierda
    if (showLeftDots) {
        tokens.push({
            key: 'dots-left',
            type: 'dots',
            page: null,
            isCurrent: false,
            disabled: true,
        });
    } else {
        const leftFill = range(boundaryCount + 1, leftSiblingIndex - 1);
        leftFill.forEach((p) => {
            tokens.push({
                key: `page-${p}`,
                type: 'page',
                page: p,
                isCurrent: p === safeCurrentPage,
                disabled: false,
            });
        });
    }

    // Zona central de páginas activas y hermanas
    const middlePages = range(
        showLeftDots ? leftSiblingIndex : boundaryCount + 1,
        showRightDots ? rightSiblingIndex : safeTotalPages - boundaryCount
    );

    middlePages.forEach((p) => {
        if (!tokens.some((t) => t.key === `page-${p}`)) {
            tokens.push({
                key: `page-${p}`,
                type: 'page',
                page: p,
                isCurrent: p === safeCurrentPage,
                disabled: false,
            });
        }
    });

    // Zona intermedia derecha
    if (showRightDots) {
        tokens.push({
            key: 'dots-right',
            type: 'dots',
            page: null,
            isCurrent: false,
            disabled: true,
        });
    } else {
        const rightFill = range(rightSiblingIndex + 1, safeTotalPages - boundaryCount);
        rightFill.forEach((p) => {
            if (!tokens.some((t) => t.key === `page-${p}`)) {
                tokens.push({
                    key: `page-${p}`,
                    type: 'page',
                    page: p,
                    isCurrent: p === safeCurrentPage,
                    disabled: false,
                });
            }
        });
    }

    // Páginas finales fijas
    endPages.forEach((p) => {
        if (!tokens.some((t) => t.key === `page-${p}`)) {
            tokens.push({
                key: `page-${p}`,
                type: 'page',
                page: p,
                isCurrent: p === safeCurrentPage,
                disabled: false,
            });
        }
    });

    return tokens;
};