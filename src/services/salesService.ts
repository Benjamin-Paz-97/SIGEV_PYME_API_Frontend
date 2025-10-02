import { apiClient, apiEndpoints } from '../config/api';
import type { Sale, SaleCreatePayload } from './authService';

// Servicio de ventas
export const salesService = {
  async getAll(): Promise<Sale[]> {
    const response = await apiClient.get(apiEndpoints.salesMine);
    return response.data;
  },

  async getById(id: string): Promise<Sale> {
    const response = await apiClient.get(apiEndpoints.salesById(id));
    return response.data;
  },

  async create(saleData: SaleCreatePayload): Promise<Sale> {
    const response = await apiClient.post(apiEndpoints.sales, saleData);
    return response.data;
  },

  async update(id: string, saleData: Partial<Sale>): Promise<Sale> {
    const response = await apiClient.put(apiEndpoints.salesById(id), saleData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(apiEndpoints.salesById(id));
  }
};