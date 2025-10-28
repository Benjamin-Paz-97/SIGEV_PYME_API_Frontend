import React, { useEffect, useState } from 'react';
import { userService, type Product, type ProductCreatePayload } from '../services/authService';
import { productService } from '../services/productService';
import '../styles/InventarioStyles.css';

const Inventario: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: 0,
    price: 0,
    minStockAlert: 5
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Solicitar permisos de notificación (desactivado temporalmente para debug)
        // if ('Notification' in window && Notification.permission === 'default') {
        //   await Notification.requestPermission();
        // }

        const user = await userService.getCurrentUser();
        setCurrentUser(user);
        
        if (user.companyId) {
          // Obtener productos de la empresa usando GET /api/Product
          try {
            const fetchedProducts = await productService.getAll();
            console.log('Todos los productos obtenidos:', fetchedProducts);
            console.log('companyId del usuario:', user.companyId);
            
            // Filtrar productos de la empresa sin try-catch para evitar problemas en mobile
            const companyProducts = fetchedProducts.filter((p: Product) => {
              const productCompanyId = String(p.companyId || '').trim();
              const userCompanyId = String(user.companyId || '').trim();
              return productCompanyId === userCompanyId;
            });
            
            console.log('Productos filtrados para la empresa:', companyProducts.length);
            setProducts(companyProducts);

            // Verificar productos con stock bajo y mostrar notificaciones
            companyProducts.forEach((product: Product) => {
              if (product.stock === 0) {
                showStockNotification(product.name, product.stock, product.minStockAlert);
              } else if (product.stock <= product.minStockAlert) {
                showStockNotification(product.name, product.stock, product.minStockAlert);
              }
            });
          } catch (productError) {
            console.error('Error obteniendo productos:', productError);
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' || name === 'price' ? Number(value) : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser?.companyId) {
      return;
    }

    try {
      const payload: ProductCreatePayload = {
        name: formData.name,
        description: formData.description,
        stock: formData.stock,
        price: formData.price,
        companyId: currentUser.companyId,
        minStockAlert: formData.minStockAlert || 5 // Valor por defecto 5 si no se ingresa
      };

      const newProduct = await productService.create(payload);
      console.log('Producto creado exitosamente:', newProduct);
      console.log('Añadiendo producto al estado local. Productos antes:', products.length);
      
      // Agregar el producto a la lista local
      setProducts(prev => {
        console.log('Actualizando products con nuevo producto. Total antes:', prev.length);
        const updated = [...prev, newProduct];
        console.log('Total después:', updated.length);
        return updated;
      });
      
      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        stock: 0,
        price: 0,
        minStockAlert: 5
      });
      setErrors({});
      setIsModalOpen(false);
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert('No se pudo crear el producto. Verifica la conexión y los datos.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      stock: 0,
      price: 0,
      minStockAlert: 5
    });
    setErrors({});
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Editando producto:', product);
    setEditingProduct(product);
    setIsEditMode(true);
    setFormData({
      name: product.name,
      description: product.description,
      stock: product.stock,
      price: product.price,
      minStockAlert: product.minStockAlert || 5
    });
    setIsModalOpen(true);
  };

  // Función para obtener el estado del stock
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return 'red';
    if (stock <= minStock) return 'amber';
    return 'green';
  };

  const getStockMessage = (stock: number, minStock: number) => {
    if (stock === 0) return 'Sin stock - Comprar urgentemente';
    if (stock <= minStock) return `Stock bajo - Solo ${stock} unidades`;
    return `Stock disponible`;
  };

  const showStockNotification = (productName: string, stock: number, minStock: number) => {
    if (stock === 0) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`⚠️ Sin stock: ${productName}`, {
          body: 'Necesitas comprar este producto urgentemente',
          icon: '🔴'
        });
      }
    } else if (stock <= minStock) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`⚠️ Stock bajo: ${productName}`, {
          body: `Solo quedan ${stock} unidades disponibles`,
          icon: '🟡'
        });
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    console.log('Eliminando producto con ID:', productId);
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      console.log('Usuario canceló la eliminación');
      return;
    }

    try {
      console.log('Enviando petición DELETE para producto:', productId);
      await productService.delete(productId);
      console.log('Producto eliminado exitosamente');
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Producto eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      alert(`No se pudo eliminar el producto. Error: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Actualizando producto:', editingProduct);
    console.log('Datos del formulario:', formData);
    
    if (!validateForm() || !editingProduct) {
      console.log('Validación falló o no hay producto editando');
      return;
    }

    try {
      console.log('Enviando petición PUT para producto:', editingProduct.id);
      const updatedProduct = await productService.update(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        stock: formData.stock,
        price: formData.price,
        minStockAlert: formData.minStockAlert || 5
      });
      
      console.log('Producto actualizado exitosamente:', updatedProduct);
      
      // Actualizar el producto en la lista local
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        stock: 0,
        price: 0,
        minStockAlert: 5
      });
      setErrors({});
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingProduct(null);
      
      alert('Producto actualizado exitosamente');
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      alert(`No se pudo actualizar el producto. Error: ${error.message || 'Error desconocido'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="inventario-container">
        <div className="loading">Cargando inventario...</div>
      </div>
    );
  }

  if (!currentUser?.companyId) {
    return (
      <div className="inventario-container">
        <div className="error">No tienes una empresa asociada para gestionar inventario</div>
      </div>
    );
  }

  return (
    <div className="inventario-container">
      <main className="inventario-main">
        <div className="inventario-content">
          {/* Header */}
          <section className="inventario-header">
            <div className="header-content">
              <h1 className="page-title">Gestión de Inventario</h1>
              <p className="page-description">
                Administra tus productos, stock y proveedores
              </p>
            </div>
            <button 
              className="add-product-button"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="button-icon">➕</span>
              Agregar Producto
            </button>
          </section>

          {/* Products Grid */}
          <section className="products-section">
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 className="empty-title">No tienes productos registrados</h3>
                <p className="empty-description">
                  Comienza agregando tu primer producto al inventario.
                </p>
                <button 
                  className="empty-button"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="button-icon">➕</span>
                  Agregar Primer Producto
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.minStockAlert);
                  const stockMessage = getStockMessage(product.stock, product.minStockAlert);
                  
                  return (
                  <div key={product.id} className={`product-card stock-${stockStatus}`}>
                    <div className="product-header">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="stock-info">
                        <span className={`stock-badge status-${stockStatus}`}>
                          {product.stock} unidades
                        </span>
                        <span className={`stock-alert alert-${stockStatus}`} title={stockMessage}>
                          {stockStatus === 'red' ? '🔴' : stockStatus === 'amber' ? '🟡' : '🟢'}
                        </span>
                      </div>
                    </div>
                    <p className="product-description">{product.description}</p>
                    <div className="product-details">
                      <div className="detail">
                        <span className="detail-label">Precio:</span>
                        <span className="detail-value">S/. {product.price.toFixed(2)}</span>
                      </div>
                      <div className="detail">
                        <span className="detail-label">Stock mínimo:</span>
                        <span className="detail-value">{product.minStockAlert}</span>
                      </div>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                    {stockStatus === 'red' && (
                      <div className="stock-warning-message">
                        <span className="warning-icon">⚠️</span>
                        <span className="warning-text">{stockMessage}</span>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal para agregar producto */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              <button className="modal-close" onClick={handleClose}>
                <span className="close-icon">×</span>
              </button>
            </div>

            <form onSubmit={isEditMode ? handleUpdateProduct : handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Ej: Laptop Dell Inspiron"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-input ${errors.description ? 'error' : ''}`}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock" className="form-label">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`form-input ${errors.stock ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && (
                    <span className="error-message">{errors.stock}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label">
                    Precio (S/.) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`form-input ${errors.price ? 'error' : ''}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="minStockAlert" className="form-label">
                    Alerta de Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    id="minStockAlert"
                    name="minStockAlert"
                    value={formData.minStockAlert}
                    onChange={handleInputChange}
                    className={`form-input ${errors.minStockAlert ? 'error' : ''}`}
                    placeholder="5"
                    min="0"
                  />
                  {errors.minStockAlert && (
                    <span className="error-message">{errors.minStockAlert}</span>
                  )}
                  <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Alerta cuando el stock sea menor a este valor (por defecto: 5)
                  </small>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={handleClose}>
                  Cancelar
                </button>
                <button type="submit" className="save-button">
                  <span className="button-icon">💾</span>
                  {isEditMode ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
