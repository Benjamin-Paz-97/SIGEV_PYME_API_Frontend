import { apiClient, apiEndpoints } from '../config/api';
import type { Product, ProductCreatePayload } from './authService';

// Servicio de productos
export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get(apiEndpoints.products);
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get(apiEndpoints.productById(id));
    return response.data;
  },

  async create(productData: ProductCreatePayload): Promise<Product> {
    const response = await apiClient.post(apiEndpoints.products, productData);
    return response.data;
  },

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await apiClient.put(apiEndpoints.productById(id), productData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(apiEndpoints.productById(id));
  }
};
