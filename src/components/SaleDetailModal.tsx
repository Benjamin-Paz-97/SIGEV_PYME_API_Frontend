import React, { useEffect, useState } from 'react';
import { type Sale, type Product } from '../services/authService';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import '../styles/SalesStyles.css';

interface SaleDetailModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (saleId: string) => void;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ sale, isOpen, onClose, onDelete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && sale) {
      const loadProducts = async () => {
        try {
          setIsLoading(true);
          const productsData = await productService.getAll();
          setProducts(productsData);
        } catch (error) {
          console.error('Error cargando productos:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadProducts();
    }
  }, [isOpen, sale]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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

  const handleDelete = async () => {
    if (!sale) return;
    
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar esta venta? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await salesService.delete(sale.id);
      onDelete(sale.id);
      onClose();
    } catch (error: any) {
      console.error('Error eliminando venta:', error);
      alert('Error al eliminar la venta: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sale-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Detalle de Venta</h2>
          <button className="modal-close" onClick={onClose}>
            <span className="close-icon">×</span>
          </button>
        </div>

        <div className="modal-content">
          {/* Información del Cliente */}
          <div className="detail-section">
            <h3 className="section-title">Información del Cliente</h3>
            <div className="client-info">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{sale.clienteNombre || 'N/A'}</span>
              </div>
              {sale.clienteDocumento && (
                <div className="info-item">
                  <span className="info-label">Documento:</span>
                  <span className="info-value">{sale.clienteDocumento}</span>
                </div>
              )}
              {sale.clienteEmail && (
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{sale.clienteEmail}</span>
                </div>
              )}
              {sale.clienteTelefono && (
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{sale.clienteTelefono}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de la Venta */}
          <div className="detail-section">
            <h3 className="section-title">Información de la Venta</h3>
            <div className="sale-info">
              <div className="info-item">
                <span className="info-label">Fecha:</span>
                <span className="info-value">{formatDate(sale.fecha)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Método de Pago:</span>
                <span className="info-value">{getPaymentMethodText(sale.metodoPago)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total:</span>
                <span className="info-value total-amount">S/. {(sale.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Productos Vendidos */}
          {sale.items && sale.items.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">Productos Vendidos</h3>
              {isLoading ? (
                <div className="loading-products">Cargando productos...</div>
              ) : (
                <div className="products-list">
                  {sale.items.map((item, index) => (
                    <div key={index} className="product-item">
                      <div className="product-info">
                        <h4 className="product-name">{getProductName(item.productoId)}</h4>
                        <div className="product-details">
                          <span className="product-quantity">Cantidad: {item.cantidad}</span>
                          <span className="product-price">Precio Unitario: S/. {item.precioUnitario.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="product-total">
                        <span className="item-total">S/. {(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Observaciones */}
          {sale.observaciones && (
            <div className="detail-section">
              <h3 className="section-title">Observaciones</h3>
              <div className="observations">
                <p>{sale.observaciones}</p>
              </div>
            </div>
          )}

          {/* Resumen Total */}
          <div className="detail-section total-summary">
            <div className="total-breakdown">
              <div className="total-line">
                <span className="total-label">Subtotal:</span>
                <span className="total-value">S/. {(sale.total || 0).toFixed(2)}</span>
              </div>
              <div className="total-line final">
                <span className="total-label">Total:</span>
                <span className="total-value">S/. {(sale.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="delete-button" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Venta'}
          </button>
          <button className="close-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
