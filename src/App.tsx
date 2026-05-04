// src/App.tsx
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/modulosPrincipales/Dashboard';
import Inventario from './pages/modulosPrincipales/Inventario';
import Ventas from './pages/modulosPrincipales/Ventas';
import Compras from './pages/modulosPrincipales/Compras';
import PuntoVenta from './pages/modulosPrincipales/PuntoVenta';
import activos from './pages/contabilidadFinanzas/activos';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/punto_venta" element={<PuntoVenta />} />
          <Route path="/activos_fijos" element={<activos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;