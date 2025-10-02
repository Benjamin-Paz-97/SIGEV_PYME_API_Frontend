import React, { useState } from 'react';
import '../styles/NewCompanyModalStyles.css';

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: CompanyData) => void;
}

interface CompanyData {
  nombre_empresa: string;
  correo: string;
  telefono: string;
  pais: string;
  num_empleados: number;
  direccion: string;
  ruc: string;
}

const NewCompanyModal: React.FC<NewCompanyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CompanyData>({
    nombre_empresa: '',
    correo: '',
    telefono: '',
    pais: '',
    num_empleados: 1,
    direccion: '',
    ruc: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_empleados' ? parseInt(value) || 1 : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_empresa.trim()) {
      newErrors.nombre_empresa = 'El nombre de la empresa es requerido';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'El formato del correo no es válido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!formData.pais.trim()) {
      newErrors.pais = 'El país es requerido';
    }

    if (formData.num_empleados < 1) {
      newErrors.num_empleados = 'Debe tener al menos 1 empleado';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.ruc.trim()) {
      newErrors.ruc = 'El RUC es requerido';
    } else if (!/^\d{11}$/.test(formData.ruc)) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
      // Resetear formulario
      setFormData({
        nombre_empresa: '',
        correo: '',
        telefono: '',
        pais: '',
        num_empleados: 1,
        direccion: '',
        ruc: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      nombre_empresa: '',
      correo: '',
      telefono: '',
      pais: '',
      num_empleados: 1,
      direccion: '',
      ruc: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Registrar Nueva Empresa</h2>
          <button className="modal-close" onClick={handleClose}>
            <span className="close-icon">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Nombre de Empresa */}
            <div className="form-group">
              <label htmlFor="nombre_empresa" className="form-label">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                id="nombre_empresa"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleInputChange}
                className={`form-input ${errors.nombre_empresa ? 'error' : ''}`}
                placeholder="Ej: Mi Empresa SAC"
              />
              {errors.nombre_empresa && (
                <span className="error-message">{errors.nombre_empresa}</span>
              )}
            </div>

            {/* Correo */}
            <div className="form-group">
              <label htmlFor="correo" className="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className={`form-input ${errors.correo ? 'error' : ''}`}
                placeholder="Ej: contacto@miempresa.com"
              />
              {errors.correo && (
                <span className="error-message">{errors.correo}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label htmlFor="telefono" className="form-label">
                Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className={`form-input ${errors.telefono ? 'error' : ''}`}
                placeholder="Ej: +51 951 907 810"
              />
              {errors.telefono && (
                <span className="error-message">{errors.telefono}</span>
              )}
            </div>

            {/* País */}
            <div className="form-group">
              <label htmlFor="pais" className="form-label">
                País *
              </label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleInputChange}
                className={`form-select ${errors.pais ? 'error' : ''}`}
              >
                <option value="">Seleccionar país</option>
                <option value="Perú">Perú</option>
                <option value="Colombia">Colombia</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Chile">Chile</option>
                <option value="Argentina">Argentina</option>
                <option value="Brasil">Brasil</option>
                <option value="México">México</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="España">España</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.pais && (
                <span className="error-message">{errors.pais}</span>
              )}
            </div>

            {/* Número de Empleados */}
            <div className="form-group">
              <label htmlFor="num_empleados" className="form-label">
                Número de Empleados *
              </label>
              <input
                type="number"
                id="num_empleados"
                name="num_empleados"
                value={formData.num_empleados}
                onChange={handleInputChange}
                className={`form-input ${errors.num_empleados ? 'error' : ''}`}
                min="1"
                max="1000"
              />
              {errors.num_empleados && (
                <span className="error-message">{errors.num_empleados}</span>
              )}
            </div>

            {/* Dirección */}
            <div className="form-group form-group-full">
              <label htmlFor="direccion" className="form-label">
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={`form-input ${errors.direccion ? 'error' : ''}`}
                placeholder="Ej: Av. Principal 123, Distrito, Ciudad"
              />
              {errors.direccion && (
                <span className="error-message">{errors.direccion}</span>
              )}
            </div>

            {/* RUC */}
            <div className="form-group form-group-full">
              <label htmlFor="ruc" className="form-label">
                RUC *
              </label>
              <input
                type="text"
                id="ruc"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                className={`form-input ${errors.ruc ? 'error' : ''}`}
                placeholder="Ej: 20123456789"
                maxLength={11}
              />
              {errors.ruc && (
                <span className="error-message">{errors.ruc}</span>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <span className="button-icon">💾</span>
              Registrar Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCompanyModal;
