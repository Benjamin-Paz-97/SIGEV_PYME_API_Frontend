import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { type Sale, type Product } from '../services/authService';
import { salesService } from '../services/salesService';
import { productService } from '../services/productService';
import '../styles/SalesStyles.css';

const DetalleVenta: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSaleDetails = async () => {
      if (!id) return;

      try {
        const [saleData, productsData] = await Promise.all([
          salesService.getById(id),
          productService.getAll()
        ]);
        
        setSale(saleData);
        setProducts(productsData);
      } catch (err: any) {
        console.error('Error cargando detalles de venta:', err);
        setError(err.message || 'Error cargando detalles de venta');
      } finally {
        setIsLoading(false);
      }
    };

    loadSaleDetails();
  }, [id]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (metodo: string) => {
    return metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta';
  };

  if (isLoading) {
    return <div className="sales-loading">Cargando detalles de venta...</div>;
  }

  if (error) {
    return <div className="sales-error">Error: {error}</div>;
  }

  if (!sale) {
    return <div className="sales-error">Venta no encontrada</div>;
  }

  return (
    <div className="detalle-venta-container">
      <div className="detalle-venta-header">
        <button className="back-button" onClick={() => navigate('/ventas')}>
          ← Volver a Ventas
        </button>
        <h1 className="page-title">Detalle de Venta</h1>
      </div>

      <div className="sale-detail-card">
        {/* Información del Cliente */}
        <div className="detail-section">
          <h3 className="section-title">Información del Cliente</h3>
          <div className="client-info">
            <div className="info-item">
              <span className="info-label">Nombre:</span>
              <span className="info-value">{sale.clienteNombre}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Documento:</span>
              <span className="info-value">{sale.clienteDocumento}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{sale.clienteEmail || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{sale.clienteTelefono || 'N/A'}</span>
            </div>
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
              <span className="info-value total-amount">S/. {sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Productos Vendidos */}
        <div className="detail-section">
          <h3 className="section-title">Productos Vendidos</h3>
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
        </div>

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
              <span className="total-value">S/. {sale.total.toFixed(2)}</span>
            </div>
            <div className="total-line final">
              <span className="total-label">Total:</span>
              <span className="total-value">S/. {sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleVenta;
