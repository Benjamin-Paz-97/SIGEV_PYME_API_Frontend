import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import NetworkTestComponent from '../components/NetworkTestComponent';
import FondoLogin from '../assets/FondoLogin.jpg';
import logo2 from '../assets/logo2.jpg';
import '../styles/LoginStyles.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Estados para el formulario de registro
  const [registerData, setRegisterData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usar el método login del contexto para actualizar el estado global
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Si es error de red/CORS, permitir login temporal para desarrollo
      if (error.message.includes('No se pudo conectar') || error.message.includes('CORS')) {
        const shouldUseTempLogin = window.confirm(
          'No se puede conectar con la API. ¿Deseas usar el modo de desarrollo temporal?'
        );
        
        if (shouldUseTempLogin) {
          // Login temporal para desarrollo
          localStorage.setItem('authToken', 'temp-dev-token');
          navigate('/');
          return;
        }
      }
      
      setError(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones adicionales
    if (!registerData.userName.trim()) {
      setError('El nombre de usuario es requerido.');
      setIsLoading(false);
      return;
    }

    if (!registerData.telefono.trim()) {
      setError('El teléfono es requerido.');
      setIsLoading(false);
      return;
    }

    if (!registerData.direccion.trim()) {
      setError('La dirección es requerida.');
      setIsLoading(false);
      return;
    }

    // Validaciones de contraseña
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      // Crear payload solo con campos que tienen valor
      const payload: any = {
        userName: registerData.userName.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        role: 0, // Rol Gerente
        companyId: null // Sin empresa inicialmente
      };

      // Solo agregar campos opcionales si tienen valor
      if (registerData.telefono.trim()) {
        payload.telefono = registerData.telefono.trim();
      }
      
      if (registerData.direccion.trim()) {
        payload.direccion = registerData.direccion.trim();
      }

      console.log('Payload de registro:', payload);
      console.log('Datos del formulario:', registerData);

      // Usar el método register del contexto para actualizar el estado global
      await register(payload);
      navigate('/');
    } catch (error: any) {
      console.error('Error en registro:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      // Mostrar error más específico del servidor
      const serverError = error.response?.data?.message || error.response?.data?.error || error.message;
      setError(serverError || 'Error al registrar usuario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setRegisterData({
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      direccion: '',
    });
  };


  return (
    <div className="login-container" style={{ backgroundImage: `url(${FondoLogin})` }}>
         <div className="login-form-container">
             <div className="login-form">
                 {/* Logo */}
                 <div className="login-logo-container">
                     <img src={logo2} alt="Logo" className="login-logo-image" />
                 </div>
                 
                 <form onSubmit={isRegisterMode ? handleRegisterSubmit : handleSubmit} className="login-form-fields">
                     {/* Mensaje de error */}
                     {error && (
                         <div className="login-error-message">
                             {error}
                         </div>
                     )}

                     {/* Campos de registro */}
                     {isRegisterMode && (
                         <>
                             {/* Campo Nombre de Usuario */}
                             <div className="login-field">
                                 <div className="login-input-container">
                                     <span className="login-input-icon">👤</span>
                                     <input
                                         type="text"
                                         placeholder="Nombre de Usuario"
                                         value={registerData.userName}
                                         onChange={(e) => handleRegisterInputChange('userName', e.target.value)}
                                         className="login-input"
                                         required
                                         disabled={isLoading}
                                     />
                                 </div>
                             </div>

                             {/* Campo Teléfono */}
                             <div className="login-field">
                                 <div className="login-input-container">
                                     <span className="login-input-icon">📞</span>
                                     <input
                                         type="tel"
                                         placeholder="Teléfono"
                                         value={registerData.telefono}
                                         onChange={(e) => handleRegisterInputChange('telefono', e.target.value)}
                                         className="login-input"
                                         required
                                         disabled={isLoading}
                                     />
                                 </div>
                             </div>

                             {/* Campo Dirección */}
                             <div className="login-field">
                                 <div className="login-input-container">
                                     <span className="login-input-icon">📍</span>
                                     <input
                                         type="text"
                                         placeholder="Dirección"
                                         value={registerData.direccion}
                                         onChange={(e) => handleRegisterInputChange('direccion', e.target.value)}
                                         className="login-input"
                                         required
                                         disabled={isLoading}
                                     />
                                 </div>
                             </div>
                         </>
                     )}

                     {/* Campo Email */}
                     <div className="login-field">
                         <div className="login-input-container">
                             <span className="login-input-icon">✉️</span>
                             <input
                                 type="email"
                                 placeholder="Correo"
                                 value={isRegisterMode ? registerData.email : email}
                                 onChange={(e) => isRegisterMode ? handleRegisterInputChange('email', e.target.value) : setEmail(e.target.value)}
                                 className="login-input"
                                 required
                                 disabled={isLoading}
                             />
                         </div>
                     </div>

                     {/* Campo Contraseña */}
                     <div className="login-field">
                         <div className="login-input-container">
                             <span className="login-input-icon">🔒</span>
                             <input
                                 type={isRegisterMode ? (showRegisterPassword ? "text" : "password") : (showPassword ? "text" : "password")}
                                 placeholder="Contraseña"
                                 value={isRegisterMode ? registerData.password : password}
                                 onChange={(e) => isRegisterMode ? handleRegisterInputChange('password', e.target.value) : setPassword(e.target.value)}
                                 className="login-input"
                                 required
                                 disabled={isLoading}
                             />
                             <button
                                 type="button"
                                 className="password-toggle"
                                 onClick={() => isRegisterMode ? setShowRegisterPassword(!showRegisterPassword) : setShowPassword(!showPassword)}
                                 disabled={isLoading}
                             >
                                 {isRegisterMode ? (showRegisterPassword ? '🙈' : '👁️') : (showPassword ? '🙈' : '👁️')}
                             </button>
                         </div>
                     </div>

                     {/* Campo Confirmar Contraseña (solo en registro) */}
                     {isRegisterMode && (
                         <div className="login-field">
                             <div className="login-input-container">
                                 <span className="login-input-icon">🔒</span>
                                 <input
                                     type={showConfirmPassword ? "text" : "password"}
                                     placeholder="Confirmar Contraseña"
                                     value={registerData.confirmPassword}
                                     onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                                     className="login-input"
                                     required
                                     disabled={isLoading}
                                 />
                                 <button
                                     type="button"
                                     className="password-toggle"
                                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                     disabled={isLoading}
                                 >
                                     {showConfirmPassword ? '🙈' : '👁️'}
                                 </button>
                             </div>
                         </div>
                     )}

                     {/* Botón Principal */}
                     <button 
                         type="submit" 
                         className="login-button login-button-primary"
                         disabled={isLoading}
                     >
                         {isLoading ? (isRegisterMode ? 'Registrando...' : 'Ingresando...') : (isRegisterMode ? 'Registrar' : 'Ingresar')}
                     </button>

                     {/* Enlaces y botones adicionales */}
                     {!isRegisterMode && (
                         <>
                             {/* Enlace Olvidaste contraseña */}
                             <a href="#" className="login-link login-forgot-password">
                                 ¿Olvidaste tu contraseña?
                             </a>

                             {/* Botón Google */}
                             <button type="button" className="login-button login-button-google">
                                 <span className="google-icon">G</span>
                                 Continuar con Google
                             </button>
                         </>
                     )}

                     {/* Registro/Login */}
                     <div className="login-register-container">
                         <span className="login-register-text">
                             {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                         </span>
                         <button 
                             type="button" 
                             className="login-button login-button-register"
                             onClick={toggleMode}
                             disabled={isLoading}
                         >
                             {isRegisterMode ? 'Iniciar Sesión' : 'Registrar'}
                         </button>
                     </div>
                 </form>
                 
                 {/* Componente de diagnóstico de red (deshabilitado) */}
                 {false && <div>{/* <NetworkTestComponent /> */}</div>}
             </div>
         </div>
    </div>
  );
};

export default Login;
