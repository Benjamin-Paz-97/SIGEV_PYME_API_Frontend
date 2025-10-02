# SIGEV PYME Frontend

Frontend de la aplicación SIGEV PYME desarrollado con React, TypeScript y Vite.

## Configuración de API

El proyecto está configurado para consumir las APIs de `https://sigev-pyme-webapi.onrender.com`.

### Servicios disponibles:

- **Autenticación** (`authService`): Login, registro y logout
- **Empresas** (`companyService`): CRUD de empresas
- **Inventario** (`inventoryService`): Gestión de inventario
- **Ventas** (`salesService`): Gestión de ventas
- **Reportes** (`reportsService`): Generación de reportes

### Uso de los servicios:

```typescript
import { authService, inventoryService, salesService } from './services';

// Autenticación
await authService.login({ email: 'user@example.com', password: 'password' });

// Inventario
const items = await inventoryService.getAll();
const newItem = await inventoryService.create(itemData);

// Ventas
const sales = await salesService.getAll();
const newSale = await salesService.create(saleData);
```

### Hook de autenticación:

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Usar el estado de autenticación
}
```

## Variables de entorno

Puedes configurar las siguientes variables de entorno:

- `VITE_API_BASE_URL`: URL base de la API (por defecto: https://sigev-pyme-webapi.onrender.com)
- `VITE_API_TIMEOUT`: Timeout de las peticiones en ms (por defecto: 10000)

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura del proyecto

```
src/
├── config/
│   └── api.ts              # Configuración de Axios
├── services/
│   ├── authService.ts      # Servicio de autenticación
│   ├── inventoryService.ts # Servicio de inventario
│   ├── salesService.ts     # Servicio de ventas
│   ├── reportsService.ts   # Servicio de reportes
│   └── index.ts           # Exportaciones
├── hooks/
│   └── useAuth.tsx        # Hook de autenticación
├── components/
│   └── ApiTestComponent.tsx # Componente de prueba de API
└── pages/                 # Páginas de la aplicación
```

## Estado de la API

El componente `ApiTestComponent` muestra el estado de conexión con la API en tiempo real. Puedes removerlo una vez que confirmes que todo funciona correctamente.
