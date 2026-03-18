import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost/proyectar/api/auth/logout.php', {}, { withCredentials: true });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const primaryItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-house-door', id: 'dashboard' },
    { path: '/ambulancias', label: 'Ambulancias', icon: 'bi-truck', id: 'ambulancias' },
    { path: '/equipos', label: 'Equipos Médicos', icon: 'bi-heart-pulse', id: 'equipos' },
    { path: '/personal', label: 'Personal', icon: 'bi-people', id: 'personal' },
    { path: '/departamentos', label: 'Departamentos', icon: 'bi-grid', id: 'departamentos' }
  ].filter(item => {
    if (user?.rol === 'admin') return true;
    return user?.permisos?.[item.id]?.ver !== false;
  });


  const secondaryItems = [
    { path: '/archivos', label: 'Multimedia', icon: 'bi-images', id: 'multimedia' },
    { path: '/sedes', label: 'Sedes', icon: 'bi-geo-alt', id: 'sedes' },
    { path: '/tipos-equipos', label: 'Tipos de Equipos', icon: 'bi-tags', id: 'tipos_equipos' },
    { path: '/informe-formulario', label: 'Informe Externo', icon: 'bi-file-earmark-spreadsheet', id: 'informe_externo' },

    ...(user?.rol === 'admin' ? [
        { path: '/usuarios', label: 'Usuarios', icon: 'bi-person-gear', id: 'usuarios' },
        { path: '/auditoria', label: 'Auditoría', icon: 'bi-clock-history', id: 'auditoria' }
    ] : [])
  ].filter(item => {
    if (user?.rol === 'admin') return true;
    return user?.permisos?.[item.id]?.ver !== false;
  });



  const navItems = [...primaryItems, ...secondaryItems];



  const renderLink = (item) => (
    <li className="nav-item" key={item.path}>
      <Link 
        className={`nav-link rounded ${location.pathname === item.path ? 'bg-light text-primary-institucional fw-bold' : 'text-white'}`} 
        to={item.path}
      >
        <i className={`bi ${item.icon} me-2`}></i>
        {item.label}
      </Link>
    </li>
  );

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-primary-institucional text-white sidebar collapse d-flex flex-column justify-content-between shadow">
          <div className="position-sticky pt-3 pb-2">
            <h4 className="text-center fw-bold py-3 mb-4 border-bottom border-light border-opacity-25">PROYECTAR</h4>
            
            <div className="px-3 mb-4">
              <small className="text-uppercase text-white-50" style={{fontSize: '10px'}}>Sesión Activa</small>
              <div className="fw-bold text-truncate">{user?.nombre}</div>
              <span className="badge bg-light text-primary-institucional mt-1" style={{fontSize: '10px'}}>{user?.rol?.toUpperCase()}</span>
            </div>

            <ul className="nav flex-column px-2 gap-1 mb-2">
              {primaryItems.map(renderLink)}
            </ul>

            <div className="d-flex justify-content-center my-3">
              <hr className="border-light border-1 opacity-50 m-0" style={{ width: '80%' }} />
            </div>

            <ul className="nav flex-column px-2 gap-1">
              {secondaryItems.map(renderLink)}
            </ul>
          </div>

          <div className="p-3 border-top border-light border-opacity-10">
            <button className="btn btn-outline-light w-100" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 bg-light min-vh-100 pb-5">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2 text-dark">
              {navItems.find(i => i.path === location.pathname)?.label || 'Panel de Administración'}
            </h1>
          </div>
          
          {/* Outlet renderiza el componente de la ruta actual (Ej: Dashboard, Ambulancias) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
