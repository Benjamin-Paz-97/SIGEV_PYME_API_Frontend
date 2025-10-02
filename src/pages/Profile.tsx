import React, { useEffect, useState } from 'react';
import { userService, type MeResponse } from '../services/authService';
import '../styles/ProfileStyles.css';

const Profile: React.FC = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getCurrentUser();
        setUser(data);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card loading">
          <div className="spinner" />
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="profile-card error">
          <h2>❌ Error</h2>
          <p>{error || 'No se pudo obtener la información del usuario'}</p>
        </div>
      </div>
    );
  }

  const getRoleName = (role: number) => {
    switch (role) {
      case 0: return 'Gerente';
      case 1: return 'Empleado';
      case 99: return 'AdminLocal';
      case 100: return 'SuperAdmin';
      default: return `Rol ${role}`;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="avatar">
          {user.userName?.charAt(0).toUpperCase()}
        </div>
        <div className="hero-info">
          <h1>{user.userName}</h1>
          <p className="role-badge">{getRoleName(user.role)}</p>
          <p className="email">{user.email}</p>
          <div className="quick-stats">
            <div className="stat">
              <span className="label">Estado</span>
              <span className={`value ${user.estado === 1 ? 'ok' : 'bad'}`}>{user.estado === 1 ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="stat">
              <span className="label">Registro</span>
              <span className="value">{new Date(user.fechaRegistro).toLocaleDateString()}</span>
            </div>
            <div className="stat">
              <span className="label">Compañía</span>
              <span className="value">{user.companyNombre || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="panel">
          <h3>Información Personal</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="label">Nombre de usuario</span>
              <span className="value">{user.userName}</span>
            </div>
            <div className="info-item">
              <span className="label">Correo</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono</span>
              <span className="value">{user.telefono || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Dirección</span>
              <span className="value">{user.direccion || '—'}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>Seguridad</h3>
          <div className="actions">
            <button className="btn primary" onClick={() => alert('Próximamente: cambiar contraseña')}>
              Cambiar contraseña
            </button>
            <button className="btn" onClick={() => alert('Próximamente: habilitar 2FA')}>
              Activar 2FA
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Compañía</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="label">ID</span>
              <span className="value">{user.companyId || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Nombre</span>
              <span className="value">{user.companyNombre || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


