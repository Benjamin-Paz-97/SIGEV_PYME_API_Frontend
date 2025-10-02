import React, { useState } from 'react';
import { companyService, authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import '../styles/CompanyRegistrationStyles.css';

interface CompanyRegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CompanyRegistration: React.FC<CompanyRegistrationProps> = ({ onSuccess, onCancel }) => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    pais: 'Perú',
    numeroEmpleados: 1,
    direccion: '',
    ruc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la empresa es requerido';
    if (!formData.correo.trim()) newErrors.correo = 'El correo es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (!formData.ruc.trim()) newErrors.ruc = 'El RUC es requerido';
    if (formData.numeroEmpleados < 1) newErrors.numeroEmpleados = 'Debe tener al menos 1 empleado';
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.correo && !emailRegex.test(formData.correo)) {
      newErrors.correo = 'Formato de email inválido';
    }
    
    // Validar formato de RUC (11 dígitos)
    const rucRegex = /^\d{11}$/;
    if (formData.ruc && !rucRegex.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;
    
    if (!user?.id) {
      setApiError('No se pudo obtener la información del usuario');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        pais: formData.pais,
        numeroEmpleados: Number(formData.numeroEmpleados),
        direccion: formData.direccion,
        ruc: formData.ruc,
        gerenteId: user.id
      };
      
      const createdCompany = await companyService.create(payload);
      console.log('Empresa creada:', createdCompany);
      
      // Actualizar el usuario con el companyId de la empresa creada
      await authService.updateUser({
        id: user.id,
        userName: user.userName,
        email: user.email,
        telefono: user.telefono,
        direccion: user.direccion,
        role: user.role,
        estado: user.estado,
        companyId: createdCompany.id
      });
      
      // Refrescar los datos del usuario para obtener el companyId actualizado
      await refreshUser();
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creando empresa:', error);
      setApiError(error.message || 'Error al registrar la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="company-registration-overlay">
      <div className="company-registration-modal">
        <div className="modal-header">
          <h2 className="modal-title">Registrar Nueva Empresa</h2>
          <button className="modal-close" onClick={onCancel}>
            <span className="close-icon">×</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          {apiError && (
            <div className="api-error-message">{apiError}</div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la Empresa *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Mi Empresa SAC"
              />
              {errors.nombre && <span className="error-message">{errors.nombre}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="ruc">RUC *</label>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                className={`form-input ${errors.ruc ? 'error' : ''}`}
                placeholder="12345678901"
                maxLength={11}
              />
              {errors.ruc && <span className="error-message">{errors.ruc}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico *</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className={`form-input ${errors.correo ? 'error' : ''}`}
                placeholder="empresa@ejemplo.com"
              />
              {errors.correo && <span className="error-message">{errors.correo}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`form-input ${errors.telefono ? 'error' : ''}`}
                placeholder="+51 999 999 999"
              />
              {errors.telefono && <span className="error-message">{errors.telefono}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="direccion">Dirección *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              className={`form-input ${errors.direccion ? 'error' : ''}`}
              placeholder="Av. Principal 123, Distrito, Ciudad"
            />
            {errors.direccion && <span className="error-message">{errors.direccion}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pais">País</label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="Perú">Perú</option>
                <option value="Colombia">Colombia</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Chile">Chile</option>
                <option value="México">México</option>
                <option value="Argentina">Argentina</option>
                <option value="Brasil">Brasil</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="España">España</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="numeroEmpleados">Número de Empleados *</label>
              <input
                type="number"
                id="numeroEmpleados"
                name="numeroEmpleados"
                value={formData.numeroEmpleados}
                onChange={handleInputChange}
                className={`form-input ${errors.numeroEmpleados ? 'error' : ''}`}
                min="1"
                max="1000"
              />
              {errors.numeroEmpleados && <span className="error-message">{errors.numeroEmpleados}</span>}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="save-button" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegistration;
