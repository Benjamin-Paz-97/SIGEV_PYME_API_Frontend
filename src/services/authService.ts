import { apiClient, apiEndpoints } from '../config/api';

// Tipos de datos
export interface Company {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  pais: string;
  numeroEmpleados: number;
  ruc: string;
  gerenteId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface User {
  id: string;
  userName: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  role: number;
  estado: number;
  fechaRegistro: string;
  companyId: string | null;
  companyNombre: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
  companyId: string;
  minStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreatePayload {
  name: string;
  description: string;
  stock: number;
  price: number;
  companyId: string;
  minStockAlert: number;
}

export interface SaleItem {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface SaleCreatePayload {
  clienteNombre: string;
  clienteDocumento: string;
  clienteEmail: string;
  clienteTelefono: string;
  items: SaleItem[];
  metodoPago: string;
  observaciones: string;
}

export interface Sale {
  id: string;
  fecha: string;
  clienteNombre: string;
  total: number;
  metodoPago: string;
  estadoPago: string;
  companyId: string | null;
  // Campos opcionales que pueden no estar presentes
  clienteDocumento?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  items?: SaleItem[];
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Servicio de autenticación
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Iniciando login con:', credentials.email);
      const response = await apiClient.post(apiEndpoints.login, credentials);
      const data: AuthResponse = response.data;
      console.log('Respuesta del login:', data);
      
      if (data?.token) {
        console.log('Token recibido, guardando en localStorage...');
        localStorage.setItem('authToken', data.token);
        console.log('Token guardado exitosamente');
      } else {
        console.warn('No se recibió token en la respuesta');
      }
      return data;
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      if (error.code === 'ERR_NETWORK') {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else if (error.response?.status === 401) {
        throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (error.response?.status === 500) {
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error inesperado. Intenta nuevamente.');
      }
    }
  },

  async register(userData: any): Promise<AuthResponse> {
    const response = await apiClient.post(apiEndpoints.register, userData);
    const data: AuthResponse = response.data;
    if (data?.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(apiEndpoints.logout);
    localStorage.removeItem('authToken');
  },

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  async getCurrentUser(): Promise<User> {
    console.log('Obteniendo datos del usuario actual...');
    const token = this.getAuthToken();
    console.log('Token actual:', token ? 'Presente' : 'No presente');
    
    const response = await apiClient.get(apiEndpoints.me);
    console.log('Datos del usuario obtenidos:', response.data);
    return response.data;
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    console.log('Actualizando datos del usuario:', userData);
    const response = await apiClient.put(apiEndpoints.updateUser, userData);
    console.log('Usuario actualizado:', response.data);
    return response.data;
  }
};

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get(apiEndpoints.me);
    return response.data;
  }
};

// Servicio de empresas
export const companyService = {
  async getAll(): Promise<Company[]> {
    const response = await apiClient.get(apiEndpoints.companies);
    return response.data;
  },

  async getById(id: string): Promise<Company> {
    const response = await apiClient.get(apiEndpoints.companyById(id));
    return response.data;
  },

  async create(payload: {
    nombre: string;
    correo: string;
    telefono: string;
    pais: string;
    numeroEmpleados: number;
    direccion: string;
    ruc: string;
    gerenteId: string;
  }): Promise<Company> {
    const response = await apiClient.post(apiEndpoints.companies, payload);
    return response.data;
  },

  async update(id: string, companyData: Partial<Company>): Promise<Company> {
    const response = await apiClient.put(apiEndpoints.companyById(id), companyData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(apiEndpoints.companyById(id));
  }
};
