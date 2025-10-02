import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import '../styles/HeaderStyles.css';

interface HeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false, onBackClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.removeItem('authToken');
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
  };

  const handleCompanyClick = () => {
    navigate('/mi-empresa');
    setIsUserMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/');
  };

  const handleServiceClick = () => {
    // Scroll to services section in dashboard
    const element = document.getElementById('servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = () => {
    // Scroll to contact section in dashboard
    const element = document.getElementById('contactanos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {showBackButton && (
            <button className="back-button" onClick={onBackClick}>
              <span className="back-icon">←</span>
              Volver
            </button>
          )}
          <div className="header-logo" onClick={handleLogoClick}>
            <h1 className="logo-text">SIGEV-PYME</h1>
            <span className="logo-subtitle">Sistema de Gestión Empresarial</span>
          </div>
        </div>
        
        <div className="header-actions">
          {/* Servicios */}
          <div className="header-section">
            <button className="header-button" onClick={handleServiceClick}>
              <span className="button-icon">📦</span>
              Servicios
            </button>
          </div>

          {/* Contactanos */}
          <div className="header-section">
            <button className="header-button" onClick={handleContactClick}>
              <span className="button-icon">📞</span>
              Contactanos
            </button>
          </div>

          {/* Usuario o Login */}
          <div className="header-section">
            {isAuthenticated ? (
              <div className="user-menu-container">
                <div className="user-avatar" onClick={handleUserMenuToggle}>
                  <span className="avatar-text">
                    {user?.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                
                {isUserMenuOpen && (
                  <div className="user-menu">
                    <div className="user-menu-item" onClick={handleProfileClick}>
                      <span className="menu-icon">👤</span>
                      Mi Perfil
                    </div>
                    <div className="user-menu-item">
                      <span className="menu-icon">⚙️</span>
                      Configuración
                    </div>
                    <div className="user-menu-item" onClick={handleCompanyClick}>
                      <span className="menu-icon">🏢</span>
                      Mi Empresa
                    </div>
                    <div className="user-menu-item logout" onClick={handleLogout}>
                      <span className="menu-icon">🚪</span>
                      Cerrar Sesión
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-button" onClick={handleLoginClick}>
                <span className="button-icon">🔑</span>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
