import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Sale } from '../services/authService';
import { salesService } from '../services/salesService';
import SaleDetailModal from '../components/SaleDetailModal';
import '../styles/SalesStyles.css';

const Ventas: React.FC = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadSales = async () => {
      try {
        console.log('Iniciando carga de ventas...');
        const salesData = await salesService.getAll();
        console.log('Ventas obtenidas:', salesData);
        console.log('Tipo de datos:', typeof salesData, Array.isArray(salesData));
        
        // Verificar que salesData sea un array
        if (Array.isArray(salesData)) {
          setSales(salesData);
        } else {
          console.error('Los datos de ventas no son un array:', salesData);
          setSales([]);
        }
      } catch (err: any) {
        console.error('Error cargando ventas:', err);
        console.error('Detalles del error:', err.response?.data, err.response?.status);
        setError(err.message || 'Error cargando ventas');
        setSales([]); // Asegurar que sales esté vacío en caso de error
      } finally {
        console.log('Finalizando carga de ventas');
        setIsLoading(false);
      }
    };

    loadSales();
  }, []);

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  const handleDeleteSale = (saleId: string) => {
    setSales(sales.filter(sale => sale.id !== saleId));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const getPaymentMethodText = (metodo: string) => {
    return metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta';
  };

  console.log('Estado actual Ventas:', { isLoading, error, sales: sales.length });

  if (isLoading) {
    console.log('Mostrando loading de ventas...');
    return (
      <div className="ventas-container">
        <div className="sales-loading">Cargando ventas...</div>
      </div>
    );
  }

  if (error) {
    console.log('Mostrando error de ventas:', error);
    return (
      <div className="ventas-container">
        <div className="sales-error">Error: {error}</div>
      </div>
    );
  }

  console.log('Mostrando contenido principal de ventas');

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1 className="page-title">Ventas</h1>
        <button className="new-sale-button" onClick={() => navigate('/ventas/nueva')}>
          <span className="button-icon">➕</span>
          Nueva Venta
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <h3 className="empty-title">No hay ventas registradas</h3>
          <p className="empty-description">
            Comienza registrando tu primera venta.
          </p>
          <button className="empty-button" onClick={() => navigate('/ventas/nueva')}>
            <span className="button-icon">➕</span>
            Crear Primera Venta
          </button>
        </div>
      ) : (
        <div className="sales-list">
          {sales.map((sale) => (
            <div key={sale.id} className="sale-card" onClick={() => handleViewDetails(sale)}>
              <div className="sale-header">
                <div className="sale-info">
                  <h3 className="sale-client">{sale.clienteNombre || 'Cliente sin nombre'}</h3>
                </div>
                <div className="sale-total">
                  <span className="total-amount">S/. {(sale.total || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="sale-details">
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatDate(sale.fecha)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Método de Pago:</span>
                  <span className="detail-value">{getPaymentMethodText(sale.metodoPago)}</span>
                </div>
              </div>
              
              <div className="sale-actions">
                <button className="view-details-button">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <SaleDetailModal
        sale={selectedSale}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteSale}
      />
    </div>
  );
};

export default Ventas;