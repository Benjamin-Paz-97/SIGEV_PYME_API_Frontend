import axios from 'axios';

// Configuración base de la API
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? '/' // usar proxy de Vite en desarrollo
  : (import.meta.env.VITE_API_BASE_URL || 'https://sigev-pyme-webapi.onrender.com');
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// Crear instancia de Axios con configuración base
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Deshabilitar cookies para evitar problemas de CORS
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de utilidad para las APIs
export const apiEndpoints = {
  // Autenticación
  login: '/api/Auth/user/login',
  register: '/api/Auth/user/register',
  logout: '/api/Auth/user/logout',
  me: '/api/Auth/user/me',
  
  // Empresas
  companies: '/api/Company',
  companyById: (id: string) => `/api/Company/${id}`,
  
  // Productos
  products: '/api/Product',
  productById: (id: string) => `/api/Product/${id}`,
  
  // Inventario (usando productos como base)
  inventory: '/api/Product',
  inventoryById: (id: string) => `/api/Product/${id}`,
  
  // Ventas
  sales: '/api/Sale',
  salesMine: '/api/Sale/mine',
  salesById: (id: string) => `/api/Sale/${id}`,
  
  // Reportes
  reports: '/reports',
  salesReport: '/reports/sales',
  inventoryReport: '/reports/inventory',
};

export default apiClient;
