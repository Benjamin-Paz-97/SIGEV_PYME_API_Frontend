import React, { useState } from 'react';

const NetworkTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult('Probando conexión...');

    try {
      // En desarrollo, usar el proxy de Vite llamando a /api
      const url = import.meta.env.DEV 
        ? '/api/Auth/user/login' // endpoint rápido que debe existir
        : 'https://sigev-pyme-webapi.onrender.com/api/Auth/user/login';

      const response = await fetch(url, {
        method: 'OPTIONS', // preflight para ver si CORS responde
        mode: 'cors',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestResult('✅ Conexión exitosa con la API');
      } else {
        setTestResult(`⚠️ API respondió con código: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error de conexión:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setTestResult('❌ Error de CORS o red. Intenta recargar tras reiniciar Vite con el proxy.');
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        setTestResult('❌ Error de red. Verifica tu conexión a internet.');
      } else {
        setTestResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{ 
      padding: '16px', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px', 
      margin: '16px 0',
      backgroundColor: '#f9fafb'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🔧 Diagnóstico de Conexión</h3>
      <button 
        onClick={testConnection}
        disabled={isTesting}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isTesting ? 'not-allowed' : 'pointer',
          opacity: isTesting ? 0.6 : 1
        }}
      >
        {isTesting ? 'Probando...' : 'Probar Conexión'}
      </button>
      {testResult && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          backgroundColor: testResult.includes('✅') ? '#dcfce7' : testResult.includes('❌') ? '#fee2e2' : '#fef3c7',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default NetworkTestComponent;
