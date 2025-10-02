import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

const ApiTestComponent: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // Intentar hacer una petición simple a la API
        const response = await apiClient.get('/');
        if (response.status === 200) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
          setErrorMessage('API respondió con un estado inesperado');
        }
      } catch (error: any) {
        setApiStatus('error');
        setErrorMessage(error.message || 'Error desconocido al conectar con la API');
      }
    };

    testApiConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Estado de la API</h3>
      <div className="flex items-center space-x-2">
        {apiStatus === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-600">Verificando conexión...</span>
          </>
        )}
        {apiStatus === 'connected' && (
          <>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-green-600">✅ Conectado a la API</span>
          </>
        )}
        {apiStatus === 'error' && (
          <>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-red-600">❌ Error de conexión</span>
          </>
        )}
      </div>
      {errorMessage && (
        <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
      )}
      <p className="text-sm text-gray-600 mt-2">
        URL: https://sigev-pyme-webapi.onrender.com
      </p>
    </div>
  );
};

export default ApiTestComponent;
