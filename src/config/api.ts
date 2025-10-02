import axios from 'axios';

// Configuración base de la API
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev 
  ? '/' // usar proxy de Vite en desarrollo
  : (import.meta.env.VITE_API_BASE_URL || 'https://sigev-pyme-webapi.onrender.com');

console.log('Environment:', isDev ? 'Development' : 'Production');
console.log('API Base URL:', API_BASE_URL);

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '15000');

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
      console.log('Request con token:', config.method?.toUpperCase(), config.url);
    } else {
      console.log('Request sin token:', config.method?.toUpperCase(), config.url);
    }
    
    // Log completo del request en producción para debugging
    if (!isDev) {
      console.log('Request config:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response exitoso:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Solo hacer logout automático si es realmente un error de autenticación
    // y no estamos en el proceso de login/registro
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/me');
      
      if (!isAuthEndpoint) {
        console.log('Token inválido, haciendo logout...');
        localStorage.removeItem('authToken');
        // Solo redirigir si no estamos ya en login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
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
  updateUser: '/api/Auth/user/update',
  
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
