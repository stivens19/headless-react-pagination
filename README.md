# headless-react-pagination

[![npm version](https://img.shields.io/npm/v/headless-react-pagination.svg)](https://www.npmjs.com/package/headless-react-pagination)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/headless-react-pagination)](https://bundlephobia.com/package/headless-react-pagination)
[![License: MIT](https://img.shields.io/npm/l/headless-react-pagination.svg)](https://github.com/stivens19/headless-react-pagination/blob/main/LICENSE)

Colección de hooks para React **100% headless, accesibles (WAI-ARIA) y sin dependencias externas** diseñados para resolver la navegación de páginas en cualquier arquitectura frontend.

---

## Características

- 🪶 **Ultraligero:** Menos de 2 KB minificado y comprimido con gzip, sin dependencias de terceros ni CSS en tiempo de ejecución.
- 🎨 **Totalmente Headless:** Compatible con Tailwind CSS, Radix UI, Shadcn UI, CSS Modules o estilos en línea.
- ♿ **WAI-ARIA y Accesibilidad de Teclado:** Soporte nativo de `aria-current`, `aria-label`, roles de accesibilidad y navegación con `←`, `→`, `Home` y `End`.
- 🌐 **Sincronización con URL:** Hook `useUrlPagination` para persistir la página en los parámetros de búsqueda (`?page=2`) de forma agnóstica al enrutador.
- 🔄 **Modo Controlado y No Controlado:** Soporte tanto para estado interno como para gestión externa delegada.
- 📐 **Matemática Determinista:** Truncado exacto con elipsis (`...`) parametrizable por `siblingCount` y `boundaryCount`.
- 🛡️ **TypeScript Nativo:** Definiciones completas de tipos, interfaces de tokens y contratos de prop getters.

---

## Instalación

```bash
npm install headless-react-pagination
```

Con gestores alternativos:

```bash
pnpm add headless-react-pagination
# o
yarn add headless-react-pagination
```

> **Requisito:** `react >= 18.0.0` y `react-dom >= 18.0.0`

---

## Casos de Uso

### Caso 1: Modo No Controlado (Estado Interno)

Ideal cuando no necesitas manipular el estado de la página fuera del componente. Solo pasas la cantidad de elementos y un callback opcional:

```tsx
import React from 'react';
import { usePagination } from 'headless-react-pagination';

export function UncontrolledExample() {
  const { tokens, getItemProps, getPrevProps, getNextProps } = usePagination({
    totalItems: 100,
    pageSize: 10,
    initialPage: 1,
    onChange: (newPage) => console.log('Página cambiada a:', newPage),
  });

  return (
    <nav style={{ display: 'flex', gap: '6px' }}>
      <button {...getPrevProps()}>Anterior</button>
      {tokens.map((token) =>
        token.type === 'dots' ? (
          <span key={token.key}>...</span>
        ) : (
          <button
            key={token.key}
            {...getItemProps(token)}
            style={{ fontWeight: token.isCurrent ? 'bold' : 'normal' }}
          >
            {token.page}
          </button>
        )
      )}
      <button {...getNextProps()}>Siguiente</button>
    </nav>
  );
}
```

---

### Caso 2: Modo Controlado (Estado Externo con `useState`)

Para sincronizar la página con un fetch de datos, filtros de búsqueda o un estado centralizado:

```tsx
import React, { useState } from 'react';
import { usePagination } from 'headless-react-pagination';

export function ControlledExample() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    tokens,
    getContainerProps,
    getItemProps,
    getPrevProps,
    getNextProps,
    getFirstProps,
    getLastProps,
  } = usePagination({
    totalItems: 300,
    pageSize: 15,
    currentPage,
    onChange: setCurrentPage,
  });

  return (
    <nav {...getContainerProps()} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <button {...getFirstProps()}>&laquo;</button>
      <button {...getPrevProps()}>&lsaquo;</button>

      {tokens.map((token) =>
        token.type === 'dots' ? (
          <span key={token.key} style={{ padding: '0 4px' }}>&hellip;</span>
        ) : (
          <button
            key={token.key}
            {...getItemProps(token)}
            style={{
              padding: '4px 8px',
              backgroundColor: token.isCurrent ? '#2563eb' : '#fff',
              color: token.isCurrent ? '#fff' : '#000',
            }}
          >
            {token.page}
          </button>
        )
      )}

      <button {...getNextProps()}>&rsaquo;</button>
      <button {...getLastProps()}>&raquo;</button>
    </nav>
  );
}
```

---

### Caso 3: Integración con Respuesta Paginada de Laravel API (`LengthAwarePaginator`)

Laravel devuelve colecciones paginadas mediante la estructura `LengthAwarePaginator` (`current_page`, `per_page`, `total`, `data`). Aquí tienes la integración directa con tipado en TypeScript:

```tsx
import React, { useEffect, useState } from 'react';
import { usePagination } from 'headless-react-pagination';

// Estructura estándar de LengthAwarePaginator en Laravel
interface LaravelPaginatorResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export function LaravelUsersTable() {
  const [paginatorData, setPaginatorData] = useState<LaravelPaginatorResponse<User> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Hook configurado directamente con los campos de Laravel
  const {
    tokens,
    getContainerProps,
    getItemProps,
    getPrevProps,
    getNextProps,
    currentPage,
    totalPages,
  } = usePagination({
    totalItems: paginatorData?.total ?? 0,
    pageSize: paginatorData?.per_page ?? 15,
    currentPage: page,
    onChange: setPage,
  });

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.tu-dominio.com/api/users?page=${page}`)
      .then((res) => res.json())
      .then((data: LaravelPaginatorResponse<User>) => {
        setPaginatorData(data);
      })
      .catch((error) => console.error('Error al consultar la API:', error))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h3>Listado de Usuarios (Página {currentPage} de {totalPages})</h3>

      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <ul>
          {paginatorData?.data.map((user) => (
            <li key={user.id}>{user.name} ({user.email})</li>
          ))}
        </ul>
      )}

      <nav {...getContainerProps()} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button {...getPrevProps()} disabled={loading || !paginatorData?.prev_page_url}>
          Anterior
        </button>

        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key}>...</span>
          ) : (
            <button
              key={token.key}
              {...getItemProps(token)}
              disabled={loading}
              style={{ fontWeight: token.isCurrent ? 'bold' : 'normal' }}
            >
              {token.page}
            </button>
          )
        )}

        <button {...getNextProps()} disabled={loading || !paginatorData?.next_page_url}>
          Siguiente
        </button>
      </nav>
    </div>
  );
}
```

---

### Caso 4: Sincronización con URL (`useUrlPagination`)

Mantiene la página reflejada en los parámetros de la URL (`?page=3`). Si el usuario recarga la ventana o comparte el enlace, conserva la posición:

```tsx
import React from 'react';
import { useUrlPagination } from 'headless-react-pagination';

export function UrlSyncExample() {
  const { tokens, getItemProps, getPrevProps, getNextProps, currentPage } = useUrlPagination({
    totalItems: 500,
    pageSize: 20,
    pageParamName: 'page', // Clave del query param
    historyMethod: 'push', // 'push' guarda en historial; 'replace' sobreescribe
    onPageChange: (p) => console.log('Navegó a:', p),
  });

  return (
    <div>
      <p>Página actual en URL: {currentPage}</p>
      <nav style={{ display: 'flex', gap: '6px' }}>
        <button {...getPrevProps()}>Anterior</button>
        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key}>...</span>
          ) : (
            <button key={token.key} {...getItemProps(token)}>
              {token.page}
            </button>
          )
        )}
        <button {...getNextProps()}>Siguiente</button>
      </nav>
    </div>
  );
}
```

---

### Caso 5: Subcomponentes Desacoplados Usando el Tipo `UsePaginationReturn`

Cuando quieres dividir tu interfaz en componentes más pequeños, puedes tipar las propiedades recibidas usando el tipo `UsePaginationReturn`:

```tsx
import React from 'react';
import { usePagination, type UsePaginationReturn } from 'headless-react-pagination';

interface NavigationControlsProps {
  pagination: UsePaginationReturn;
}

// Subcomponente reutilizable
function NavigationControls({ pagination }: NavigationControlsProps) {
  const { tokens, getItemProps, getPrevProps, getNextProps } = pagination;

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <button {...getPrevProps()}>Prev</button>
      {tokens.map((token) =>
        token.type === 'dots' ? (
          <span key={token.key}>...</span>
        ) : (
          <button key={token.key} {...getItemProps(token)}>
            {token.page}
          </button>
        )
      )}
      <button {...getNextProps()}>Next</button>
    </div>
  );
}

// Componente principal
export function ParentComponent() {
  const pagination = usePagination({
    totalItems: 80,
    pageSize: 10,
  });

  return (
    <div>
      <h2>Panel Administrativo</h2>
      <NavigationControls pagination={pagination} />
    </div>
  );
}
```

---

### Caso 6: Estilo Moderno con Tailwind CSS

```tsx
import React, { useState } from 'react';
import { usePagination } from 'headless-react-pagination';

export function TailwindPagination() {
  const [page, setPage] = useState(1);

  const { tokens, getContainerProps, getItemProps, getPrevProps, getNextProps } = usePagination({
    totalItems: 180,
    pageSize: 10,
    currentPage: page,
    onChange: setPage,
  });

  return (
    <nav {...getContainerProps()} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
      <button
        {...getPrevProps()}
        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      {tokens.map((token) =>
        token.type === 'dots' ? (
          <span key={token.key} className="px-2 text-xs text-gray-400 select-none">
            &hellip;
          </span>
        ) : (
          <button
            key={token.key}
            {...getItemProps(token)}
            className={`min-w-[32px] px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              token.isCurrent
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {token.page}
          </button>
        )
      )}

      <button
        {...getNextProps()}
        className="px-2.5 py-1.5 text-xs font-medium text-gray-700 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </nav>
  );
}
```

---

## Accesibilidad (WAI-ARIA y Soporte de Teclado)

La función `getContainerProps()` aplica los atributos requeridos por WAI-ARIA y añade soporte completo de navegación por teclado al enfocar el elemento contenedor:

- **Flecha Izquierda (`ArrowLeft`):** Retrocede a la página anterior si existe.
- **Flecha Derecha (`ArrowRight`):** Avanza a la página siguiente si existe.
- **Inicio (`Home`):** Salta directamente a la primera página.
- **Fin (`End`):** Salta directamente a la última página.

Atributos automáticos generados en los botones:
- `aria-current="page"` para el botón de la página seleccionada.
- `aria-label="Página X"` en cada botón numérico.
- `aria-hidden="true"` y `tabIndex="-1"` en los separadores de elipsis (`dots`).

---

## Referencia de la API

### `usePagination(options)`

#### `UsePaginationOptions`

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `totalItems` | `number` | **Requerido** | Total acumulado de registros. |
| `pageSize` | `number` | `10` | Cantidad de registros mostrados por página. |
| `currentPage` | `number` | `undefined` | Página activa en modo controlado. |
| `initialPage` | `number` | `1` | Página activa de inicio en modo no controlado. |
| `siblingCount` | `number` | `1` | Cantidad de números visibles contiguos a la página activa. |
| `boundaryCount` | `number` | `1` | Cantidad de números fijos al comienzo y al final. |
| `onChange` | `(page: number) => void` | `undefined` | Callback ejecutado cuando cambia la página. |

#### `UsePaginationReturn`

| Retorno | Tipo | Descripción |
| :--- | :--- | :--- |
| `currentPage` | `number` | Página activa en curso. |
| `totalPages` | `number` | Número total de páginas calculado. |
| `totalItems` | `number` | Número total de registros provisto. |
| `pageSize` | `number` | Registros por página activos. |
| `hasPrevPage` | `boolean` | `true` si hay página anterior. |
| `hasNextPage` | `boolean` | `true` si hay página siguiente. |
| `isFirstPage` | `boolean` | `true` si se encuentra en la página 1. |
| `isLastPage` | `boolean` | `true` si se encuentra en la última página. |
| `tokens` | `PaginationToken[]` | Array con los objetos a renderizar (números o elipsis). |
| `goToPage(page)` | `(page: number) => void` | Salta directamente al número de página indicado. |
| `nextPage()` | `() => void` | Avanza una página. |
| `prevPage()` | `() => void` | Retrocede una página. |
| `firstPage()` | `() => void` | Salta a la página 1. |
| `lastPage()` | `() => void` | Salta a la última página calculada. |
| `jumpPages(offset)` | `(offset: number) => void` | Salto relativo de páginas (ej. `+5` o `-5`). |
| `getContainerProps()` | `function` | Retorna props y eventos de teclado para el contenedor `<nav>`. |
| `getItemProps(token, overrides?)` | `function` | Retorna props, ARIA y click handler para el botón del token. |
| `getPrevProps(overrides?)` | `function` | Retorna props para el botón "Anterior". |
| `getNextProps(overrides?)` | `function` | Retorna props para el botón "Siguiente". |
| `getFirstProps(overrides?)` | `function` | Retorna props para el botón "Primera". |
| `getLastProps(overrides?)` | `function` | Retorna props para el botón "Última". |

---

### `useUrlPagination(options)`

Acepta las mismas opciones que `usePagination` a excepción de `currentPage`, `initialPage` y `onChange`, e incorpora:

| Propiedad | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `pageParamName` | `string` | `'page'` | Nombre del parámetro en la query string (ej. `?page=3`). |
| `historyMethod` | `'push' \| 'replace'` | `'push'` | Estrategia de modificación del historial del navegador. |
| `onPageChange` | `(page: number) => void` | `undefined` | Callback adicional al actualizarse el parámetro en la URL. |

---

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).