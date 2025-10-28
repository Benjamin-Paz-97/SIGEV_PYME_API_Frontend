import React, { useEffect, useState } from 'react';
import { userService, type Product } from '../services/authService';
import { productService } from '../services/productService';

const Compras: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setCurrentUser(userData);
        
        if (userData.companyId) {
          const allProducts = await productService.getAll();
          const companyProducts = allProducts.filter((p: Product) => {
            const productCompanyId = String(p.companyId || '').trim();
            const userCompanyId = String(userData.companyId || '').trim();
            return productCompanyId === userCompanyId;
          });
          setProducts(companyProducts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseQuantity(0);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || purchaseQuantity <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    try {
      setIsUpdating(true);
      
      // Actualizar el stock sumando la cantidad comprada
      const updatedProduct = await productService.update(selectedProduct.id, {
        name: selectedProduct.name,
        description: selectedProduct.description,
        stock: selectedProduct.stock + purchaseQuantity,
        price: selectedProduct.price,
        minStockAlert: selectedProduct.minStockAlert
      });
      
      // Actualizar el producto en el estado local
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      ));
      
      alert(`✅ Compra exitosa! ${purchaseQuantity} unidades añadidas al stock de ${selectedProduct.name}`);
      
      // Cerrar modal
      setIsModalOpen(false);
      setSelectedProduct(null);
      setPurchaseQuantity(0);
    } catch (error: any) {
      console.error('Error en compra:', error);
      alert(`Error: ${error.message || 'No se pudo realizar la compra'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        Cargando productos...
      </div>
    );
  }

  if (!currentUser?.companyId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        No tienes una empresa asociada
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '8px' }}>Compras</h1>
      <p style={{ color: '#555', marginTop: 0, marginBottom: '24px' }}>
        Selecciona un producto y especifica cuántas unidades deseas comprar
      </p>

      {products.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '12px', 
          textAlign: 'center',
          border: '1px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h3>No hay productos registrados</h3>
          <p style={{ color: '#666' }}>Agrega productos en el Inventario primero</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '16px' 
        }}>
          {products.map((product) => (
            <div key={product.id} style={{ 
              background: '#fff', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>{product.name}</h3>
                <span style={{ 
                  background: product.stock <= product.minStockAlert ? '#fee2e2' : '#dcfce7',
                  color: product.stock <= product.minStockAlert ? '#dc2626' : '#166534',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  Stock: {product.stock}
                </span>
              </div>
              
              {product.description && (
                <p style={{ color: '#666', margin: '8px 0', fontSize: '14px' }}>{product.description}</p>
              )}
              
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Precio:</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>S/. {product.price.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Stock mínimo:</span>
                  <span style={{ color: '#666' }}>{product.minStockAlert}</span>
                </div>
              </div>

              <button 
                onClick={() => handlePurchase(product)}
                style={{ 
                  width: '100%', 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: '#111827', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🛒 Comprar Stock
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de compra */}
      {isModalOpen && selectedProduct && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => !isUpdating && setIsModalOpen(false)}>
          <div style={{ 
            background: '#fff', 
            padding: '24px', 
            borderRadius: '12px', 
            maxWidth: '500px', 
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Comprar Stock: {selectedProduct.name}</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '8px 0', color: '#666' }}><strong>Stock actual:</strong> {selectedProduct.stock} unidades</p>
              <p style={{ margin: '8px 0', color: '#666' }}><strong>Stock mínimo:</strong> {selectedProduct.minStockAlert} unidades</p>
              {selectedProduct.stock <= selectedProduct.minStockAlert && (
                <p style={{ margin: '8px 0', color: '#dc2626', fontWeight: '600' }}>
                  ⚠️ Stock bajo - Se recomienda comprar al menos {selectedProduct.minStockAlert + 1 - selectedProduct.stock} unidades
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Cantidad a comprar:
              </label>
              <input
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                min="1"
                placeholder="0"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db',
                  fontSize: '16px'
                }}
                disabled={isUpdating}
              />
              {purchaseQuantity > 0 && (
                <p style={{ margin: '8px 0', color: '#166534' }}>
                  Stock después de la compra: <strong>{selectedProduct.stock + purchaseQuantity}</strong> unidades
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
                style={{ 
                  padding: '10px 20px', 
                  background: '#efefef', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmPurchase}
                disabled={isUpdating || purchaseQuantity <= 0}
                style={{ 
                  padding: '10px 20px', 
                  background: isUpdating || purchaseQuantity <= 0 ? '#ccc' : '#111827', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: isUpdating || purchaseQuantity <= 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {isUpdating ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;

