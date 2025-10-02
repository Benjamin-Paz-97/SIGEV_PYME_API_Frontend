import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, companyService, authService, type Company, type Product, type Sale } from '../services/authService';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { useAuth } from '../hooks/useAuth';
import BarChart from '../components/BarChart';
import CompanyRegistration from '../components/CompanyRegistration';
import '../styles/MiEmpresaStyles.css';

const MiEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        console.log('Iniciando carga de datos de empresa...');
        const user = await userService.getCurrentUser();
        console.log('Usuario obtenido:', user);

        if (user.companyId) {
          console.log('Usuario tiene empresa ID:', user.companyId);
          const companyData = await companyService.getById(user.companyId);
          console.log('Datos de empresa obtenidos:', companyData);
          console.log('Nombre de empresa:', companyData?.nombre);
          console.log('Email de empresa:', companyData?.correo);
          
          console.log('Empresa obtenida:', companyData);
          setCompany(companyData);
          
          // Obtener productos de la empresa
          try {
            const allProducts = await productService.getAll();
            console.log('Productos obtenidos:', allProducts);
            const companyProducts = allProducts.filter((p: Product) => p.companyId === user.companyId);
            console.log('Productos de la empresa:', companyProducts);
            setProducts(companyProducts);
          } catch (productError) {
            console.error('Error obteniendo productos:', productError);
            // Continuar sin productos si hay error
          }

          // Obtener ventas de la empresa
          try {
            const allSales = await salesService.getAll();
            console.log('Ventas obtenidas:', allSales);
            setSales(allSales);
          } catch (salesError) {
            console.error('Error obteniendo ventas:', salesError);
            // Continuar sin ventas si hay error
          }
        } else {
          console.log('Usuario no tiene empresa asociada');
          setError('No tienes una empresa registrada.');
        }
      } catch (err: any) {
        console.error('Error fetching company data:', err);
        setError(err.message || 'No se pudo cargar la información de la empresa.');
      } finally {
        console.log('Finalizando carga de datos');
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const handleServiceClick = (path: string) => {
    navigate(path);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    // Recargar datos de la empresa
    window.location.reload();
  };

  const handleRegisterCompany = () => {
    setShowRegistration(true);
  };

  const handleDeleteCompany = async () => {
    try {
      if (!company?.id) return;
      const confirmed = window.confirm('¿Seguro que deseas eliminar esta empresa? Esta acción es irreversible.');
      if (!confirmed) return;

      setIsDeleting(true);
      console.log('Eliminando empresa con id:', company.id);
      await companyService.delete(company.id);
      console.log('Empresa eliminada. Actualizando usuario para limpiar companyId...');

      // Limpiar companyId del usuario
      const currentUser = user || (await userService.getCurrentUser());
      await authService.updateUser({ id: currentUser.id, companyId: null });
      await refreshUser();

      // Limpiar estados locales y mostrar registro
      setCompany(null);
      setProducts([]);
      setSales([]);
      setShowRegistration(true);
      alert('Empresa eliminada correctamente. Puedes registrar una nueva empresa.');
    } catch (e: any) {
      console.error('Error eliminando empresa:', e);
      alert(e?.message || 'No se pudo eliminar la empresa.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calcular estadísticas reales desde la API
  const totalProducts = products.length;

  // Calcular ganancias mensuales
  const calculateMonthlyEarnings = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Crear array de meses con sus nombres
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    
    // Calcular ganancias para los últimos 6 meses
    const monthlyEarnings = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    for (let i = 5; i >= 0; i--) {
      const targetMonth = (currentMonth - i + 12) % 12;
      const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      
      // Filtrar ventas del mes específico
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.fecha || sale.createdAt);
        return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear;
      });
      
      // Calcular total de ganancias del mes
      const monthTotal = monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      
      monthlyEarnings.push({
        label: months[targetMonth],
        value: monthTotal,
        color: colors[5 - i]
      });
    }
    
    return monthlyEarnings;
  };

  const salesData = calculateMonthlyEarnings();
  
  // Calcular ganancias del mes actual
  const currentMonthEarnings = salesData[salesData.length - 1]?.value || 0;

  console.log('Estado actual:', { isLoading, error, company: !!company, products: products.length });

  if (isLoading) {
    console.log('Mostrando loading...');
    return <div className="mi-empresa-loading">Cargando información de la empresa...</div>;
  }

  if (error && !company) {
    console.log('Mostrando estado de error sin empresa:', error);
    return (
      <div className="mi-empresa-container">
        <div className="mi-empresa-empty">
          <div className="empty-icon">🏢</div>
          <h3 className="empty-title">No hay empresa asociada</h3>
          <p className="empty-description">
            Tu usuario no está asociado a ninguna empresa. Puedes registrar una nueva empresa.
          </p>
          <button className="register-company-button" onClick={handleRegisterCompany}>
            <span className="button-icon">🏢</span>
            Registrar Nueva Empresa
          </button>
        </div>
        
        {showRegistration && (
          <CompanyRegistration
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegistration(false)}
          />
        )}
      </div>
    );
  }

  if (!company) {
    console.log('Mostrando error general:', error);
    return <div className="mi-empresa-error">Error: {error}</div>;
  }

  console.log('Mostrando contenido principal de la empresa');

  return (
    <div className="mi-empresa-container">
      <div className="mi-empresa-content">
        {/* Información de la Empresa */}
        <div className="company-info-card">
          <div className="company-header">
            <div className="company-logo-circle">
              {company.nombre ? company.nombre.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="company-details">
              <h2 className="company-name">{company.nombre || 'Empresa'}</h2>
              <p className="company-email">{company.correo || 'Sin email'}</p>
              <div className="company-meta">
                <span className="meta-item">📅 Registrada: {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}</span>
                <span className="meta-item">🔄 Actualizada: {company.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="company-info-grid">
            <div className="info-item">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{company.telefono || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{company.direccion || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">País:</span>
              <span className="info-value">{company.pais || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">RUC:</span>
              <span className="info-value">{company.ruc || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Empleados:</span>
              <span className="info-value">{company.numeroEmpleados || 0}</span>
            </div>
          </div>
        </div>

        {/* Dashboard con Estadísticas */}
        <div className="dashboard-section">
          <h3 className="section-title">Dashboard Empresarial</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-value">{totalProducts}</div>
                <div className="stat-label">Productos</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">S/. {currentMonthEarnings.toFixed(2)}</div>
                <div className="stat-label">Ganancias (Mes)</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Reportes</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Clientes</div>
              </div>
            </div>
          </div>

          {/* Gráfico de Ganancias Mensuales */}
          <div className="chart-section">
            <BarChart 
              data={salesData} 
              title="Ganancias Mensuales (S/.)" 
              maxValue={Math.max(...salesData.map(d => d.value), 1000)}
            />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="actions-section">
          <h3 className="section-title">Acciones Rápidas</h3>
          <div className="actions-grid">
            <button className="action-button primary" onClick={() => handleServiceClick('/inventario')}>
              <span className="button-icon">📦</span>
              <div className="button-content">
                <div className="button-title">Gestionar Inventario</div>
                <div className="button-subtitle">{totalProducts} productos registrados</div>
              </div>
            </button>
            
            <button className="action-button secondary" onClick={() => handleServiceClick('/ventas')}>
              <span className="button-icon">💰</span>
              <div className="button-content">
                <div className="button-title">Ver Ventas</div>
                <div className="button-subtitle">S/. {currentMonthEarnings.toFixed(2)} este mes</div>
              </div>
            </button>
            
            <button className="action-button secondary" disabled>
              <span className="button-icon">📊</span>
              <div className="button-content">
                <div className="button-title">Generar Reportes</div>
                <div className="button-subtitle">Próximamente disponible</div>
              </div>
            </button>
            
            <button className="action-button secondary" disabled>
              <span className="button-icon">👥</span>
              <div className="button-content">
                <div className="button-title">Gestionar Clientes</div>
                <div className="button-subtitle">Próximamente disponible</div>
              </div>
            </button>

            <button className="action-button secondary" onClick={handleDeleteCompany} disabled={isDeleting}>
              <span className="button-icon">🗑️</span>
              <div className="button-content">
                <div className="button-title">Eliminar Empresa</div>
                <div className="button-subtitle">{isDeleting ? 'Eliminando...' : 'Esta acción es irreversible'}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiEmpresa;