import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MiEmpresa from './pages/MiEmpresa';
import Inventario from './pages/Inventario';
import Ventas from './pages/Ventas';
import NuevaVenta from './pages/NuevaVenta';
import DetalleVenta from './pages/DetalleVenta';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/:empresaId" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mi-empresa" 
              element={
                <ProtectedRoute>
                  <MiEmpresa />
                </ProtectedRoute>
              } 
            />
                <Route 
                  path="/inventario" 
                  element={
                    <ProtectedRoute>
                      <Inventario />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ventas" 
                  element={
                    <ProtectedRoute>
                      <Ventas />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ventas/nueva" 
                  element={
                    <ProtectedRoute>
                      <NuevaVenta />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ventas/:id" 
                  element={
                    <ProtectedRoute>
                      <DetalleVenta />
                    </ProtectedRoute>
                  } 
                />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
