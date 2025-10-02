import { apiClient, apiEndpoints } from '../config/api';

// Tipos de datos para reportes
export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  topProducts: Array<{
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  category?: string;
}

// Servicio de reportes
export const reportsService = {
  async getSalesReport(filters: ReportFilters): Promise<SalesReport> {
    const params = new URLSearchParams();
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`${apiEndpoints.salesReport}?${params}`);
    return response.data;
  },

  async getInventoryReport(): Promise<InventoryReport> {
    const response = await apiClient.get(apiEndpoints.inventoryReport);
    return response.data;
  },

  async getGeneralReport(filters: ReportFilters): Promise<any> {
    const params = new URLSearchParams();
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    if (filters.category) params.append('category', filters.category);

    const response = await apiClient.get(`${apiEndpoints.reports}?${params}`);
    return response.data;
  },

  async exportReport(reportType: 'sales' | 'inventory' | 'general', format: 'pdf' | 'excel', filters?: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
    }

    const response = await apiClient.get(`${apiEndpoints.reports}/export/${reportType}?${params}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
