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
import Activos from './pages/contabilidadFinanzas/Activos';
import Nomina from './pages/recursosHumanos/Nomina';
import NomencladoresPage from "./pages/configuracion/Nomencladores";
import LicenciasPage from './pages/configuracion/Licencias';
import ClientesPage from './pages/clientesProveedores/Clientes';
import ContabilidadPage from './pages/contabilidadFinanzas/Contabilidad';
import FinanzasPage from './pages/contabilidadFinanzas/Finanzas';

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
          <Route path="/contabilidad" element={<ContabilidadPage />} />
          <Route path="/finanzas" element={<FinanzasPage />} />
          <Route path="/activos_fijos" element={<Activos />} />
          <Route path="/nomina" element={<Nomina />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/nomencladores" element={<NomencladoresPage />} />
          <Route path="/licencias" element={<LicenciasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;