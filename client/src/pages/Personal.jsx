import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [ambulancias, setAmbulancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', nombre: '', tipo_identificacion: 'CC', identificacion: '', cargo: '', ambulancia_id: '', estado: 'Activo' });
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.personal || {});


  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPersonal, resAmbulancias] = await Promise.all([
        axios.get('http://localhost/proyectar/api/personal/read.php', { withCredentials: true }),
        axios.get('http://localhost/proyectar/api/ambulancias/read.php', { withCredentials: true })
      ]);
      setPersonal(Array.isArray(resPersonal.data) ? resPersonal.data : []);
      setAmbulancias(Array.isArray(resAmbulancias.data) ? resAmbulancias.data : []);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (persona) => {
    setFormData({
      id: persona.id,
      nombre: persona.nombre,
      tipo_identificacion: persona.tipo_identificacion || 'CC',
      identificacion: persona.identificacion || '',
      cargo: persona.cargo,
      ambulancia_id: persona.ambulancia_id || '',
      estado: persona.estado
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar registro de personal?')) {
      try {
        await axios.post('http://localhost/proyectar/api/personal/delete.php', { id }, { withCredentials: true });
        fetchData();
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Actualizar
        await axios.post('http://localhost/proyectar/api/personal/update.php', formData, { withCredentials: true });
      } else {
        // Crear
        await axios.post('http://localhost/proyectar/api/personal/create.php', formData, { withCredentials: true });
      }
      setShowForm(false);
      setFormData({ id: '', nombre: '', tipo_identificacion: 'CC', identificacion: '', cargo: '', ambulancia_id: '', estado: 'Activo' });
      fetchData();
    } catch (error) {
      alert('Error en el formulario de personal.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestión de Personal</h2>
        {permisos.crear && (
            <button className="btn btn-primary-institucional" onClick={() => {
                setFormData({ id: '', nombre: '', tipo_identificacion: 'CC', identificacion: '', cargo: '', ambulancia_id: '', estado: 'Activo' });
                setShowForm(!showForm);
            }}>
            {showForm ? 'Cancelar' : 'Nuevo Personal'}
            </button>
        )}
      </div>


      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">{formData.id ? 'Editar Personal' : 'Registrar Nuevo Personal'}</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Nombre Completo</label>
                <input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Tipo ID</label>
                <select className="form-select" value={formData.tipo_identificacion} onChange={e => setFormData({...formData, tipo_identificacion: e.target.value})} required>
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="TI">TI</option>
                  <option value="PAS">PAS</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Identificación</label>
                <input type="text" className="form-control" value={formData.identificacion} onChange={e => setFormData({...formData, identificacion: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Cargo</label>
                <select className="form-select" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} required>
                  <option value="">Seleccione...</option>
                  <option value="Conductor">Conductor</option>
                  <option value="Paramédico">Paramédico</option>
                  <option value="Enfermero">Enfermero</option>
                  <option value="Médico">Médico</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Ambulancia Asignada</label>
                <select className="form-select" value={formData.ambulancia_id} onChange={e => setFormData({...formData, ambulancia_id: e.target.value})}>
                  <option value="">Ninguna</option>
                  {ambulancias.filter(a => a.estado === 'Activa').map(amb => (
                    <option key={amb.id} value={amb.id}>{amb.movil ? 'Móvil ' + amb.movil : amb.placa}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Estado</label>
                <select className="form-select" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="col-12 mt-4 text-end">
                <button type="submit" className="btn btn-success">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Identificación</th>
                  <th>Cargo</th>
                  <th>Ambulancia asignd.</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personal.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No hay personal registrado.</td></tr>
                ) : (
                  personal.map(persona => (
                      <tr key={persona.id}>
                        <td className="fw-bold">{persona.nombre}</td>
                        <td>
                          <span className="text-muted small">{persona.tipo_identificacion}</span> {persona.identificacion}
                        </td>
                        <td>{persona.cargo}</td>
                        <td>
                          {persona.ambulancia_movil ? (
                            <div className="d-flex flex-column align-items-start">
                              <span className="badge bg-primary-institucional">Móvil {persona.ambulancia_movil}</span>
                              <small className="text-muted" style={{fontSize: '10px'}}>{persona.ambulancia_placa}</small>
                            </div>
                          ) : persona.ambulancia_placa ? (
                            <span className="badge bg-secondary">{persona.ambulancia_placa}</span>
                          ) : (
                            <span className="text-muted fst-italic">Sin asignar</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${persona.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                            {persona.estado}
                          </span>
                        </td>
                        <td className="text-end">
                          {permisos.editar && <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(persona)}><i className="bi bi-pencil"></i></button>}
                          {permisos.eliminar && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(persona.id)}><i className="bi bi-trash"></i></button>}
                        </td>
                      </tr>

                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personal;
