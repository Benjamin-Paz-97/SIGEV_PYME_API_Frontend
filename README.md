# SIGEV-PYME Frontend

Sistema de Gestión Empresarial para PYMEs - Frontend

## 🚀 Despliegue en Render.com

### Configuración de Build:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

### Variables de Entorno:
- `VITE_API_BASE_URL`: `https://sigev-pyme-webapi.onrender.com`
- `VITE_API_TIMEOUT`: `10000`

### Funcionalidades:
- ✅ Sistema de autenticación (Login/Registro)
- ✅ Dashboard empresarial con ganancias mensuales
- ✅ Gestión de inventario de productos
- ✅ Sistema de ventas completo
- ✅ Modal de detalles mejorado
- ✅ Gráficos de barras para análisis
- ✅ Gestión de empresas
- ✅ Interfaz responsive y moderna

### Tecnologías:
- React 19 + TypeScript
- Vite (Build Tool)
- Axios (HTTP Client)
- CSS Modules
- React Router DOM

### API Backend:
- URL: https://sigev-pyme-webapi.onrender.com
- Endpoints: Auth, Company, Product, Sale

### Desarrollo Local:
```bash
npm install
npm run dev
```

### Build para Producción:
```bash
npm run build
```

### Preview Local:
```bash
npm run preview
```