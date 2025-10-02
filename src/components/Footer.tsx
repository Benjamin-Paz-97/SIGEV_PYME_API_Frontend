import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/FooterStyles.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      // Si ya estamos en dashboard, recargar la página
      if (window.location.pathname === '/dashboard') {
        window.location.reload();
      } else {
        // Si no estamos en dashboard, navegar allí
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  const handleServiceClick = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title" onClick={handleLogoClick}>SIGEV-PYME</h3>
          <p className="footer-description">
            Sistema integral de gestión empresarial para pequeñas y medianas empresas.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-subtitle">Servicios</h4>
          <ul className="footer-links">
            <li><button onClick={() => handleServiceClick('/inventario')} className="footer-link">Gestión de Inventario</button></li>
            <li><button onClick={() => handleServiceClick('/ventas')} className="footer-link">Ventas y Facturación</button></li>
            <li><button onClick={() => handleServiceClick('/compras')} className="footer-link">Compras</button></li>
            <li><button onClick={() => handleServiceClick('/reportes')} className="footer-link">Reportes</button></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-subtitle">Contactanos</h4>
          <ul className="footer-links">
            <li><a href="mailto:soporte@sigev-pyme.com" className="footer-link">soporte@sigev-pyme.com</a></li>
            <li><a href="tel:+51951907810" className="footer-link">(+51) 951 907 810</a></li>
            <li>Tingo Maria, Perú</li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 SIGEV-PYME. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
