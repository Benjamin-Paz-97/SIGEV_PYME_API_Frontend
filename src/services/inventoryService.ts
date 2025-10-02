import { apiClient, apiEndpoints } from '../config/api';

// Tipos de datos para inventario
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFilters {
  category?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Servicio de inventario
export const inventoryService = {
  async getAll(filters?: InventoryFilters): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.supplier) params.append('supplier', filters.supplier);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    const response = await apiClient.get(`${apiEndpoints.inventory}?${params}`);
    return response.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const response = await apiClient.get(apiEndpoints.inventoryById(id));
    return response.data;
  },

  async create(itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const response = await apiClient.post(apiEndpoints.inventory, itemData);
    return response.data;
  },

  async update(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await apiClient.put(apiEndpoints.inventoryById(id), itemData);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(apiEndpoints.inventoryById(id));
  },

  async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    const response = await apiClient.patch(`${apiEndpoints.inventoryById(id)}/stock`, { quantity });
    return response.data;
  }
};
