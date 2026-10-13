import React, { useState, useEffect } from 'react';
import {
  usePagination,
  useUrlPagination,
  type UsePaginationReturn,
} from './lib';

// ==========================================
// ESTILOS BÁSICOS COMPARTIDOS
// ==========================================
const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1.25rem',
  marginBottom: '1.5rem',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
};

const buttonBaseStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  background: '#ffffff',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '13px',
  transition: 'all 0.15s ease',
};

// ==========================================
// CASO 1: MODO NO CONTROLADO (Estado Interno)
// ==========================================
function CaseUncontrolled() {
  const { tokens, getContainerProps, getItemProps, getPrevProps, getNextProps, currentPage, totalPages } =
    usePagination({
      totalItems: 80,
      pageSize: 10,
      initialPage: 1,
      onChange: (p) => console.log('[Uncontrolled] Nueva página:', p),
    });

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
        Caso 1: Modo No Controlado (Estado Interno)
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#6b7280' }}>
        Página activa: <strong>{currentPage}</strong> de {totalPages} (80 elementos en total)
      </p>

      <nav {...getContainerProps()} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button {...getPrevProps()} style={buttonBaseStyle}>
          &lsaquo; Anterior
        </button>

        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key} style={{ padding: '0 4px', color: '#9ca3af' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={token.key}
              {...getItemProps(token)}
              style={{
                ...buttonBaseStyle,
                background: token.isCurrent ? '#2563eb' : '#fff',
                color: token.isCurrent ? '#fff' : '#374151',
                borderColor: token.isCurrent ? '#2563eb' : '#d1d5db',
                fontWeight: token.isCurrent ? 600 : 400,
              }}
            >
              {token.page}
            </button>
          )
        )}

        <button {...getNextProps()} style={buttonBaseStyle}>
          Siguiente &rsaquo;
        </button>
      </nav>
    </div>
  );
}

// ==========================================
// CASO 2: MODO CONTROLADO (Estado Externo)
// ==========================================
function CaseControlled() {
  const [page, setPage] = useState(3);

  const {
    tokens,
    getContainerProps,
    getItemProps,
    getPrevProps,
    getNextProps,
    getFirstProps,
    getLastProps,
    currentPage,
    totalPages,
  } = usePagination({
    totalItems: 350,
    pageSize: 15,
    currentPage: page,
    onChange: setPage,
    siblingCount: 1,
    boundaryCount: 1,
  });

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
        Caso 2: Modo Controlado con `useState` y Botones de Extremo
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#6b7280' }}>
        Página activa: <strong>{currentPage}</strong> de {totalPages} (350 elementos, 15 por página)
      </p>

      <nav {...getContainerProps()} style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button {...getFirstProps()} style={buttonBaseStyle}>
          &laquo; Primero
        </button>
        <button {...getPrevProps()} style={buttonBaseStyle}>
          &lsaquo; Anterior
        </button>

        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key} style={{ padding: '0 4px', color: '#9ca3af' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={token.key}
              {...getItemProps(token)}
              style={{
                ...buttonBaseStyle,
                background: token.isCurrent ? '#059669' : '#fff',
                color: token.isCurrent ? '#fff' : '#374151',
                borderColor: token.isCurrent ? '#059669' : '#d1d5db',
                fontWeight: token.isCurrent ? 600 : 400,
              }}
            >
              {token.page}
            </button>
          )
        )}

        <button {...getNextProps()} style={buttonBaseStyle}>
          Siguiente &rsaquo;
        </button>
        <button {...getLastProps()} style={buttonBaseStyle}>
          Último &raquo;
        </button>
      </nav>
    </div>
  );
}

// ==========================================
// CASO 3: SIMULACIÓN DE RESPUESTA LARAVEL API
// ==========================================
interface UserItem {
  id: number;
  name: string;
  email: string;
}

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

function CaseLaravelApi() {
  const [page, setPage] = useState(1);
  const [paginatorData, setPaginatorData] = useState<LaravelPaginatorResponse<UserItem> | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulación del backend de Laravel
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const perPage = 5;
      const total = 42;
      const totalPages = Math.ceil(total / perPage);
      const startIdx = (page - 1) * perPage + 1;
      const endIdx = Math.min(page * perPage, total);

      const mockUsers: UserItem[] = Array.from(
        { length: endIdx - startIdx + 1 },
        (_, i) => ({
          id: startIdx + i,
          name: `Usuario #${startIdx + i}`,
          email: `user${startIdx + i}@empresa.com`,
        })
      );

      setPaginatorData({
        current_page: page,
        data: mockUsers,
        first_page_url: '/api/users?page=1',
        from: startIdx,
        last_page: totalPages,
        next_page_url: page < totalPages ? `/api/users?page=${page + 1}` : null,
        path: '/api/users',
        per_page: perPage,
        prev_page_url: page > 1 ? `/api/users?page=${page - 1}` : null,
        to: endIdx,
        total: total,
      });
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [page]);

  const {
    tokens,
    getContainerProps,
    getItemProps,
    getPrevProps,
    getNextProps,
    currentPage,
    totalPages,
  } = usePagination({
    totalItems: paginatorData?.total ?? 42, // Valor base para que calcule el total desde el inicio
    pageSize: paginatorData?.per_page ?? 5,
    currentPage: page,
    onChange: (newPage) => {
      // Evitamos disparar nuevas peticiones si ya está cargando
      if (!loading) {
        setPage(newPage);
      }
    },
  });

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
        Caso 3: Integración con Respuesta de Laravel API (`LengthAwarePaginator`)
      </h3>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '14px', color: '#6b7280' }}>
        Total de registros devueltos: <strong>{paginatorData?.total ?? 42}</strong> ({paginatorData?.per_page ?? 5} por página)
      </p>

      {/* Lista simulada */}
      <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', minHeight: '120px' }}>
        {loading ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#4b5563' }}>Cargando registros desde API...</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '13px', color: '#1f2937' }}>
            {paginatorData?.data.map((u) => (
              <li key={u.id} style={{ marginBottom: '2px' }}>
                <strong>{u.name}</strong> - <span>{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Barra de navegación accesible */}
      <nav
        {...getContainerProps()}
        style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          outline: 'none',
          padding: '4px',
          borderRadius: '6px',
        }}
      >
        <button
          {...getPrevProps()}
          style={{
            ...buttonBaseStyle,
            opacity: currentPage === 1 || loading ? 0.5 : 1,
            cursor: currentPage === 1 || loading ? 'not-allowed' : 'pointer',
          }}
        >
          &lsaquo; Anterior
        </button>

        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key} style={{ padding: '0 4px', color: '#9ca3af' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={token.key}
              {...getItemProps(token)}
              style={{
                ...buttonBaseStyle,
                background: token.isCurrent ? '#4f46e5' : '#fff',
                color: token.isCurrent ? '#fff' : '#374151',
                borderColor: token.isCurrent ? '#4f46e5' : '#d1d5db',
                fontWeight: token.isCurrent ? 600 : 400,
                opacity: loading && !token.isCurrent ? 0.6 : 1,
              }}
            >
              {token.page}
            </button>
          )
        )}

        <button
          {...getNextProps()}
          style={{
            ...buttonBaseStyle,
            opacity: currentPage === totalPages || loading ? 0.5 : 1,
            cursor: currentPage === totalPages || loading ? 'not-allowed' : 'pointer',
          }}
        >
          Siguiente &rsaquo;
        </button>

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b7280' }}>
          Página {currentPage} de {totalPages}
        </span>
      </nav>
    </div>
  );
}

// ==========================================
// CASO 4: SINCRONIZACIÓN CON URL
// ==========================================
function CaseUrlSync() {
  const { tokens, getContainerProps, getItemProps, getPrevProps, getNextProps, currentPage, totalPages } =
    useUrlPagination({
      totalItems: 120,
      pageSize: 10,
      pageParamName: 'page',
      historyMethod: 'push',
      onPageChange: (p) => console.log('[URL Sync] Parámetro de URL actualizado a:', p),
    });

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
        Caso 4: Sincronización con URL (`useUrlPagination`)
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#6b7280' }}>
        Cambia de página y observa cómo cambia la barra de direcciones del navegador (<code>?page={currentPage}</code>). Si recargas la página (F5), se mantendrá aquí.
      </p>

      <nav {...getContainerProps()} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button {...getPrevProps()} style={buttonBaseStyle}>
          &lsaquo; Anterior
        </button>

        {tokens.map((token) =>
          token.type === 'dots' ? (
            <span key={token.key} style={{ padding: '0 4px', color: '#9ca3af' }}>
              &hellip;
            </span>
          ) : (
            <button
              key={token.key}
              {...getItemProps(token)}
              style={{
                ...buttonBaseStyle,
                background: token.isCurrent ? '#d97706' : '#fff',
                color: token.isCurrent ? '#fff' : '#374151',
                borderColor: token.isCurrent ? '#d97706' : '#d1d5db',
                fontWeight: token.isCurrent ? 600 : 400,
              }}
            >
              {token.page}
            </button>
          )
        )}

        <button {...getNextProps()} style={buttonBaseStyle}>
          Siguiente &rsaquo;
        </button>
      </nav>
    </div>
  );
}

// ==========================================
// CASO 5: SUBCOMPONENTE CON TIPO TIPADO
// ==========================================
interface SubControlsProps {
  pagination: UsePaginationReturn;
}

function SubPaginationControls({ pagination }: SubControlsProps) {
  const { tokens, getItemProps, getPrevProps, getNextProps } = pagination;

  return (
    <div style={{ display: 'inline-flex', gap: '4px', background: '#f3f4f6', padding: '4px', borderRadius: '6px' }}>
      <button {...getPrevProps()} style={{ ...buttonBaseStyle, padding: '4px 8px' }}>
        Prev
      </button>

      {tokens.map((token) =>
        token.type === 'dots' ? (
          <span key={token.key} style={{ padding: '4px', color: '#9ca3af' }}>
            ...
          </span>
        ) : (
          <button
            key={token.key}
            {...getItemProps(token)}
            style={{
              ...buttonBaseStyle,
              padding: '4px 8px',
              background: token.isCurrent ? '#111827' : '#ffffff',
              color: token.isCurrent ? '#ffffff' : '#374151',
              fontWeight: token.isCurrent ? 600 : 400,
            }}
          >
            {token.page}
          </button>
        )
      )}

      <button {...getNextProps()} style={{ ...buttonBaseStyle, padding: '4px 8px' }}>
        Next
      </button>
    </div>
  );
}

function CaseSubComponent() {
  const pagination = usePagination({
    totalItems: 50,
    pageSize: 10,
  });

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>
        Caso 5: Subcomponente desacoplado usando el tipo `UsePaginationReturn`
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#6b7280' }}>
        Pasa el objeto retornado completo como prop tipada en TypeScript hacia otros componentes.
      </p>

      <SubPaginationControls pagination={pagination} />
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL (SHOWCASE)
// ==========================================
export default function App() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2.5rem 1.5rem',
        maxWidth: '760px',
        margin: '0 auto',
        color: '#111827',
      }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          headless-react-pagination: Showcase de Pruebas
        </h1>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
          Verificación en vivo de todos los casos de uso documentados en el README.
        </p>
      </header>

      <CaseUncontrolled />
      <CaseControlled />
      <CaseLaravelApi />
      <CaseUrlSync />
      <CaseSubComponent />

      <footer style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
        💡 <strong>Prueba de accesibilidad:</strong> Haz clic en cualquier paginador y usa las flechas <code>←</code> / <code>→</code>, o las teclas <code>Home</code> / <code>End</code> para navegar con el teclado.
      </footer>
    </main>
  );
}