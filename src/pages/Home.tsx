import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewCompanyModal from '../components/NewCompanyModal';
import { userService, companyService } from '../services/authService';
import '../styles/HomeStyles.css';

interface CompanyData {
  nombre_empresa: string;
  correo: string;
  telefono: string;
  pais: string;
  num_empleados: number;
  direccion: string;
  ruc: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Empresa de ejemplo
  const [empresas, setEmpresas] = useState([
    {
      id: 1,
      nombre: 'TechCorp Solutions',
      descripcion: 'Empresa de tecnología especializada en desarrollo de software',
      industria: 'Tecnología',
      empleados: 25,
      fechaCreacion: '2023-01-15',
      estado: 'Activa',
      color: '#3b82f6'
    }
  ]);

  const handleEmpresaClick = (empresaId: number) => {
    navigate(`/dashboard/${empresaId}`);
  };

  const handleNuevaEmpresa = () => {
    setIsModalOpen(true);
  };

  // Logout ahora es manejado globalmente desde el Header (layout)

  const handleSaveCompany = async (companyData: CompanyData) => {
    try {
      // Usar el usuario logueado para gerenteId
      const me = currentUser || (await userService.getCurrentUser());
      if (!currentUser) {
        setCurrentUser(me);
      }

      const payload = {
        nombre: companyData.nombre_empresa,
        correo: companyData.correo,
        telefono: companyData.telefono,
        pais: companyData.pais,
        numeroEmpleados: companyData.num_empleados,
        direccion: companyData.direccion,
        ruc: companyData.ruc,
        gerenteId: me.id,
      };

      const created = await companyService.create(payload);

      // Refrescar grilla localmente con datos mínimos
      const nuevaEmpresa = {
        id: (empresas.length ? Math.max(...empresas.map(e => e.id)) : 0) + 1,
        nombre: created.nombre || payload.nombre,
        descripcion: `Empresa registrada por ${me.userName}`,
        industria: 'General',
        empleados: payload.numeroEmpleados,
        fechaCreacion: new Date().toISOString().split('T')[0],
        estado: 'Activa',
        color: '#10b981'
      };
      setEmpresas(prev => [...prev, nuevaEmpresa]);
    } catch (error) {
      console.error('Error creando empresa:', error);
      alert('No se pudo registrar la empresa. Verifica la conexión y los datos.');
    }
  };

  // Cargar usuario actual para controlar permisos de creación
  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await userService.getCurrentUser();
        setCurrentUser(me);
      } catch (e) {
        // Silenciar: la ruta está protegida, si falla, no mostramos botón
      }
    };
    loadMe();
  }, []);

  // Mostrar botón solo si es GERENTE (role === 0) y no tiene companyId asignado
  const canCreateCompany = currentUser?.role === 0 && !currentUser?.companyId;

  return (
    <div className="home-container">
      <main className="home-main">
        <div className="home-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-header">
              <div>
                <h1 className="welcome-title">Gestiona tus Empresas</h1>
                <p className="welcome-description">
                  Administra todas tus empresas desde un solo lugar. Accede a inventario, 
                  ventas, reportes y más para cada una de tus empresas.
                </p>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="actions-section">
            <div className="actions-header">
              <h2 className="section-title">Mis Empresas</h2>
              {canCreateCompany && (
                <button className="new-company-button" onClick={handleNuevaEmpresa}>
                  <span className="button-icon">➕</span>
                  Registrar Nueva Empresa
                </button>
              )}
            </div>

            {/* Companies Grid */}
            <div className="companies-grid">
              {empresas.map((empresa) => (
                <div 
                  key={empresa.id} 
                  className="company-card"
                  onClick={() => handleEmpresaClick(empresa.id)}
                >
                  <div className="company-header">
                    <div 
                      className="company-logo" 
                      style={{ backgroundColor: empresa.color }}
                    >
                      {empresa.nombre.charAt(0)}
                    </div>
                    <div className="company-info">
                      <h3 className="company-name">{empresa.nombre}</h3>
                      <span className="company-industry">{empresa.industria}</span>
                    </div>
                    <div className="company-status">
                      <span className={`status-badge ${empresa.estado.toLowerCase()}`}>
                        {empresa.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div className="company-description">
                    <p>{empresa.descripcion}</p>
                  </div>
                  
                  <div className="company-stats">
                    <div className="stat">
                      <span className="stat-label">Empleados</span>
                      <span className="stat-value">{empresa.empleados}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Desde</span>
                      <span className="stat-value">
                        {new Date(empresa.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="company-actions">
                    <button className="access-button">
                      <span className="button-icon">🚀</span>
                      Acceder al Dashboard
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Empty State */}
              {empresas.length === 0 && canCreateCompany && (
                <div className="empty-state">
                  <div className="empty-icon">🏢</div>
                  <h3 className="empty-title">No tienes empresas registradas</h3>
                  <p className="empty-description">
                    Comienza registrando tu primera empresa para acceder al sistema de gestión.
                  </p>
                  <button className="empty-button" onClick={handleNuevaEmpresa}>
                    <span className="button-icon">➕</span>
                    Registrar Primera Empresa
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <h2 className="section-title">¿Qué puedes hacer con SIGEV-PYME?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📦</div>
                <h3 className="feature-title">Gestión de Inventario</h3>
                <p className="feature-description">
                  Controla tu stock, productos y proveedores de manera eficiente.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3 className="feature-title">Ventas y Facturación</h3>
                <p className="feature-description">
                  Registra ventas, genera facturas y lleva el control de ingresos.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3 className="feature-title">Reportes y Análisis</h3>
                <p className="feature-description">
                  Obtén insights valiosos con reportes detallados de tu negocio.
                </p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3 className="feature-title">Gestión de Clientes</h3>
                <p className="feature-description">
                  Mantén un registro completo de tus clientes y su historial.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Modal para nueva empresa */}
      <NewCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default Home;
