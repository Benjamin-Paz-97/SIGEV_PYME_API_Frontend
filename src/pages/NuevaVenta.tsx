import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, type Product, type SaleCreatePayload, type SaleItem } from '../services/authService';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import '../styles/SalesStyles.css';

const NuevaVenta: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Tipo de comprobante
  const [tipoComprobante, setTipoComprobante] = useState<'boleta' | 'factura'>('boleta');

  // Datos del cliente
  const [clienteData, setClienteData] = useState({
    clienteNombre: '',
    clienteDocumento: '',
    clienteEmail: '',
    clienteTelefono: '',
  });

  // Datos de la venta
  const [saleData, setSaleData] = useState({
    metodoPago: 'efectivo',
    observaciones: '',
  });

  // Items de la venta
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await userService.getCurrentUser();
        
        if (user.companyId) {
          // Obtener productos con stock disponible
          const allProducts = await productService.getAll();
          const companyProducts = allProducts.filter((p: Product) => 
            p.companyId === user.companyId && p.stock > 0
          );
          setProducts(companyProducts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setApiError('Error cargando datos');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTipoComprobanteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTipo = e.target.value as 'boleta' | 'factura';
    setTipoComprobante(newTipo);
    
    // Limpiar datos del cliente al cambiar tipo
    setClienteData({
      clienteNombre: '',
      clienteDocumento: '',
      clienteEmail: '',
      clienteTelefono: '',
    });
    setErrors({});
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClienteData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSaleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSaleData(prev => ({ ...prev, [name]: value }));
  };

  const addProductToSale = () => {
    if (!selectedProduct || itemQuantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Verificar si el producto ya está en la venta
    const existingItemIndex = saleItems.findIndex(item => item.productoId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Actualizar cantidad del producto existente
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].cantidad += itemQuantity;
      setSaleItems(updatedItems);
    } else {
      // Agregar nuevo producto
      const newItem: SaleItem = {
        productoId: selectedProduct,
        cantidad: itemQuantity,
        precioUnitario: product.price
      };
      setSaleItems([...saleItems, newItem]);
    }

    // Limpiar selección
    setSelectedProduct('');
    setItemQuantity(1);
  };

  const removeItemFromSale = (productoId: string) => {
    setSaleItems(saleItems.filter(item => item.productoId !== productoId));
  };

  const updateItemQuantity = (productoId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromSale(productoId);
      return;
    }

    const updatedItems = saleItems.map(item =>
      item.productoId === productoId
        ? { ...item, cantidad: newQuantity }
        : item
    );
    setSaleItems(updatedItems);
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);
  };

  // Verificar si el total supera 700 soles
  const totalVenta = calculateTotal();
  const requiereFactura = totalVenta > 700;

  useEffect(() => {
    // Si el total supera 700, forzar factura
    if (requiereFactura && tipoComprobante === 'boleta') {
      setTipoComprobante('factura');
      // Limpiar datos del cliente al cambiar tipo
      setClienteData({
        clienteNombre: '',
        clienteDocumento: '',
        clienteEmail: '',
        clienteTelefono: '',
      });
    }
  }, [totalVenta, requiereFactura, tipoComprobante]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones según el tipo de comprobante
    if (tipoComprobante === 'boleta') {
      // Boleta: solo requiere DNI
      if (!clienteData.clienteDocumento.trim()) {
        newErrors.clienteDocumento = 'El DNI es requerido';
      }
    } else {
      // Factura: requiere RUC y nombre
      if (!clienteData.clienteDocumento.trim()) {
        newErrors.clienteDocumento = 'El RUC es requerido';
      }
      if (!clienteData.clienteNombre.trim()) {
        newErrors.clienteNombre = 'El nombre o razón social es requerido';
      }
    }
    
    if (saleItems.length === 0) newErrors.items = 'Debe agregar al menos un producto';
    
    // Validar formato de email si se proporciona
    if (clienteData.clienteEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteData.clienteEmail)) {
      newErrors.clienteEmail = 'Formato de email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Ajustar datos según el tipo de comprobante
      let finalClienteData = { ...clienteData };
      
      if (tipoComprobante === 'boleta') {
        // Para boleta: el DNI va en clienteDocumento y también en clienteNombre
        finalClienteData.clienteNombre = clienteData.clienteDocumento;
      }
      // Para factura: se mantienen RUC en clienteDocumento y nombre en clienteNombre

      const payload: SaleCreatePayload = {
        ...finalClienteData,
        items: saleItems,
        metodoPago: saleData.metodoPago,
        observaciones: saleData.observaciones
      };

      await salesService.create(payload);
      navigate('/ventas');
    } catch (error: any) {
      console.error('Error creando venta:', error);
      setApiError(error.message || 'Error al crear la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="sales-loading">Cargando productos...</div>;
  }

  return (
    <div className="nueva-venta-container">
      <div className="nueva-venta-header">
        <h1 className="page-title">Nueva Venta</h1>
        <button className="back-button" onClick={() => navigate('/ventas')}>
          ← Volver a Ventas
        </button>
      </div>

      <form onSubmit={handleSubmit} className="venta-form">
        {apiError && (
          <div className="api-error-message">{apiError}</div>
        )}

        {/* Tipo de Comprobante */}
        <div className="form-section">
          <h3 className="section-title">Tipo de Comprobante</h3>
          {requiereFactura && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              color: '#92400e'
            }}>
              ⚠️ El total supera los S/. 700. Solo se permite emitir factura (requiere RUC).
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoComprobante">Comprobante *</label>
              <select
                id="tipoComprobante"
                value={tipoComprobante}
                onChange={handleTipoComprobanteChange}
                className="form-input"
                disabled={requiereFactura}
              >
                <option value="boleta" disabled={requiereFactura}>Boleta</option>
                <option value="factura">Factura</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="form-section">
          <h3 className="section-title">Información del Cliente</h3>
          <div className="form-row">
            {tipoComprobante === 'factura' && (
              <div className="form-group">
                <label htmlFor="clienteNombre">Nombre o Razón Social *</label>
                <input
                  type="text"
                  id="clienteNombre"
                  name="clienteNombre"
                  value={clienteData.clienteNombre}
                  onChange={handleClienteChange}
                  className={`form-input ${errors.clienteNombre ? 'error' : ''}`}
                  placeholder="Ej: Importadora ABC S.A."
                />
                {errors.clienteNombre && <span className="error-message">{errors.clienteNombre}</span>}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="clienteDocumento">
                {tipoComprobante === 'boleta' ? 'DNI *' : 'RUC *'}
              </label>
              <input
                type="text"
                id="clienteDocumento"
                name="clienteDocumento"
                value={clienteData.clienteDocumento}
                onChange={handleClienteChange}
                className={`form-input ${errors.clienteDocumento ? 'error' : ''}`}
                placeholder={tipoComprobante === 'boleta' ? 'Ej: 12345678' : 'Ej: 20123456789'}
              />
              {errors.clienteDocumento && <span className="error-message">{errors.clienteDocumento}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clienteEmail">Email</label>
              <input
                type="email"
                id="clienteEmail"
                name="clienteEmail"
                value={clienteData.clienteEmail}
                onChange={handleClienteChange}
                className={`form-input ${errors.clienteEmail ? 'error' : ''}`}
                placeholder="cliente@email.com"
              />
              {errors.clienteEmail && <span className="error-message">{errors.clienteEmail}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="clienteTelefono">Teléfono</label>
              <input
                type="tel"
                id="clienteTelefono"
                name="clienteTelefono"
                value={clienteData.clienteTelefono}
                onChange={handleClienteChange}
                className="form-input"
                placeholder="+51 999 999 999"
              />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="form-section">
          <h3 className="section-title">Productos</h3>
          
          <div className="add-product-section">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="selectedProduct">Producto</label>
                <select
                  id="selectedProduct"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="form-input"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Stock: {product.stock} - S/. {product.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="itemQuantity">Cantidad</label>
                <input
                  type="number"
                  id="itemQuantity"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                  className="form-input"
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <button type="button" onClick={addProductToSale} className="add-product-button">
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>

          {/* Lista de productos agregados */}
          {saleItems.length > 0 && (
            <div className="sale-items-section">
              <h4>Productos en la Venta</h4>
              <div className="sale-items-list">
                {saleItems.map((item, index) => {
                  const product = products.find(p => p.id === item.productoId);
                  return (
                    <div key={index} className="sale-item">
                      <div className="item-info">
                        <span className="item-name">{product?.name}</span>
                        <span className="item-price">S/. {item.precioUnitario}</span>
                      </div>
                      <div className="item-controls">
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => updateItemQuantity(item.productoId, Number(e.target.value))}
                          className="quantity-input"
                          min="1"
                        />
                        <span className="item-total">S/. {(item.cantidad * item.precioUnitario).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeItemFromSale(item.productoId)}
                          className="remove-item-button"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {errors.items && <span className="error-message">{errors.items}</span>}
        </div>

        {/* Información de Pago */}
        <div className="form-section">
          <h3 className="section-title">Información de Pago</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="metodoPago">Método de Pago</label>
              <select
                id="metodoPago"
                name="metodoPago"
                value={saleData.metodoPago}
                onChange={handleSaleChange}
                className="form-input"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={saleData.observaciones}
                onChange={handleSaleChange}
                className="form-input"
                rows={3}
                placeholder="Notas adicionales sobre la venta..."
              />
            </div>
          </div>
        </div>

        {/* Total y Botones */}
        <div className="form-section total-section">
          <div className="total-display">
            <span className="total-label">Total:</span>
            <span className="total-amount">S/. {calculateTotal().toFixed(2)}</span>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/ventas')} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-button">
              {isSubmitting ? 'Procesando...' : 'Crear Venta'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NuevaVenta;
