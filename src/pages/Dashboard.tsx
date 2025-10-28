import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardStyles.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyName = user?.companyNombre || 'Sin empresa';
  const waMessage = encodeURIComponent(`Hola soporte, necesito ayuda con SIGEV-PYME. Empresa: ${companyName}.`);
  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Gestiona tu Empresa</h2>
            <p className="welcome-description">
              Tu sistema integral de gestión empresarial. Administra inventario, 
              ventas, reportes y mucho más desde un solo lugar.
            </p>
          </section>

              {/* Plans Section */}
              <section className="plans-section">
                <h3 className="section-title">Planes Disponibles</h3>
                <div className="plans-grid">
                  <div className="plan-card fremiun">
                    <div className="plan-header">
                      <h4 className="plan-name">FREMIUN</h4>
                      <div className="plan-price">
                        <span className="price-amount">S/. 0</span>
                        <span className="price-period">/mes</span>
                      </div>
                    </div>
                    <ul className="plan-features">
                      <li>✅ Hasta 100 productos</li>
                      <li>✅ Gestión básica de inventario</li>
                      <li>✅ Reportes simples</li>
                      <li>✅ Soporte por email</li>
                    </ul>
                    <button className="plan-button current">Plan Actual</button>
                  </div>

                  <div className="plan-card premium-pro">
                    <div className="plan-header">
                      <h4 className="plan-name">PREMIUM PRO</h4>
                      <div className="plan-price">
                        <span className="price-amount">S/. 29</span>
                        <span className="price-period">/mes</span>
                      </div>
                    </div>
                    <ul className="plan-features">
                      <li>✅ Productos ilimitados</li>
                      <li>✅ Múltiples almacenes</li>
                      <li>✅ Integración con bancos</li>
                      <li>✅ API completa</li>
                      <li>✅ Soporte 24/7</li>
                    </ul>
                    <button className="plan-button">Actualizar</button>
                  </div>

                  <div className="plan-card premium-ultra">
                    <div className="plan-header">
                      <h4 className="plan-name">PREMIUM ULTRA</h4>
                      <div className="plan-price">
                        <span className="price-amount">S/. 49</span>
                        <span className="price-period">/mes</span>
                      </div>
                    </div>
                    <ul className="plan-features">
                      <li>✅ Todo de PREMIUM PRO</li>
                      <li>✅ Múltiples empresas</li>
                      <li>✅ Personalización completa</li>
                      <li>✅ Consultoría incluida</li>
                      <li>✅ Migración de datos</li>
                    </ul>
                    <button className="plan-button">Actualizar</button>
                  </div>
                </div>
              </section>

          {/* Services Section */}
          <section id="servicios" className="services-section">
            <h3 className="section-title">Servicios</h3>
            <div className="services-grid">
              <div className="service-card" onClick={() => navigate('/inventario')} role="button" tabIndex={0}>
                <div className="service-icon">📦</div>
                <h4 className="service-title">Gestión de Inventario</h4>
                <p className="service-description">Controla tu stock, productos y proveedores</p>
              </div>
              
              <div className="service-card" onClick={() => navigate('/ventas')} role="button" tabIndex={0}>
                <div className="service-icon">💰</div>
                <h4 className="service-title">Ventas y Facturación</h4>
                <p className="service-description">Registra ventas y genera facturas</p>
              </div>
              
              <div className="service-card" onClick={() => navigate('/soporte')} role="button" tabIndex={0}>
                <div className="service-icon">🛟</div>
                <h4 className="service-title">Soporte</h4>
                <p className="service-description">Ayuda, preguntas frecuentes y contacto directo</p>
              </div>

              <div className="service-card" onClick={() => navigate('/compras')} role="button" tabIndex={0}>
                <div className="service-icon">🛒</div>
                <h4 className="service-title">Compras</h4>
                <p className="service-description">Gestiona órdenes de compra y proveedores</p>
              </div>
              
              <div className="service-card" onClick={() => navigate('/reportes')} role="button" tabIndex={0}>
                <div className="service-icon">📊</div>
                <h4 className="service-title">Reportes</h4>
                <p className="service-description">Analiza el rendimiento de tu empresa</p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contactanos" className="contact-section">
            <h3 className="section-title">Contactanos</h3>
            <div className="contact-content">
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>soporte@sigev-pyme.com</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Teléfono</h4>
                    <p>
                      <a
                        href={`https://wa.me/51951907810?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (+51) 951 907 810
                      </a>
                    </p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Ubicación</h4>
                    <p>Tingo Maria, Perú</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
