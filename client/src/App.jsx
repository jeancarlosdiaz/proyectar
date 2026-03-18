import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ambulancias from './pages/Ambulancias';
import Personal from './pages/Personal';
import Equipos from './pages/Equipos';
import Auditoria from './pages/Auditoria';
import Sedes from './pages/Sedes';
import Departamentos from './pages/Departamentos';
import Archivos from './pages/Archivos';
import TiposEquipos from './pages/TiposEquipos';
import Usuarios from './pages/Usuarios';
import AmbulanciaDetalleV2 from './pages/AmbulanciaDetalleV2';
import EquipoHojaVidaV2 from './pages/EquipoHojaVidaV2';
import InformeFormulario from './pages/InformeFormulario';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas con el Menú Lateral (Layout) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ambulancias" element={<Ambulancias />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/auditoria" element={<Auditoria />} />
          <Route path="/sedes" element={<Sedes />} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/archivos" element={<Archivos />} />
          <Route path="/tipos-equipos" element={<TiposEquipos />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/ambulancia-detalle/:id" element={<AmbulanciaDetalleV2 />} />
          <Route path="/equipo-hoja-vida/:id" element={<EquipoHojaVidaV2 />} />
          <Route path="/informe-formulario" element={<InformeFormulario />} />
        </Route>




        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
