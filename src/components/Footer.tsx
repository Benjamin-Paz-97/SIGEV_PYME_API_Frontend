import React from 'react';
import '../styles/FooterStyles.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">SIGEV-PYME</h3>
          <p className="footer-description">
            Sistema integral de gestión empresarial para pequeñas y medianas empresas.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-subtitle">Servicios</h4>
          <ul className="footer-links">
            <li><a href="/inventario" className="footer-link">Gestión de Inventario</a></li>
            <li><a href="/ventas" className="footer-link">Ventas y Facturación</a></li>
            <li><a href="/compras" className="footer-link">Compras</a></li>
            <li><a href="/reportes" className="footer-link">Reportes</a></li>
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
