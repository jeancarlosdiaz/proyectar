import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TiposEquipos = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTipo, setFormTipo] = useState({ id: '', nombre: '' });
  const [editando, setEditando] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.tipos_equipos || {});


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost/proyectar/api/tipos_equipos/read.php', { withCredentials: true });
      setTipos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.post('http://localhost/proyectar/api/tipos_equipos/update.php', formTipo, { withCredentials: true });
      } else {
        await axios.post('http://localhost/proyectar/api/tipos_equipos/create.php', formTipo, { withCredentials: true });
      }
      setFormTipo({ id: '', nombre: '' });
      setEditando(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar el tipo de equipo');
    }
  };

  const handleEdit = (tipo) => {
    setFormTipo({ id: tipo.id, nombre: tipo.nombre });
    setEditando(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este tipo de equipo? No puede tener equipos asociados.')) {
      try {
        await axios.post('http://localhost/proyectar/api/tipos_equipos/delete.php', { id }, { withCredentials: true });
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar el tipo de equipo');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="mb-4">Gestión de Tipos de Equipos</h2>
      
      <div className="row">
        {permisos.crear && (
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">{editando ? 'Editar Tipo' : 'Nuevo Tipo de Equipo'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre del Tipo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formTipo.nombre} 
                      onChange={e => setFormTipo({...formTipo, nombre: e.target.value.toUpperCase()})} 
                      required 
                      placeholder="EJ: DESFIBRILADOR" 
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary-institucional w-100">
                      {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editando && (
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={() => {setEditando(false); setFormTipo({id:'', nombre:''})}}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={permisos.crear ? "col-md-8" : "col-12"}>

          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre de la Categoría</th>
                    <th>Fecha Registro</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tipos.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-4 text-muted">No hay tipos de equipos registrados.</td></tr>
                  ) : (
                    tipos.map(t => (
                      <tr key={t.id}>
                        <td className="fw-bold text-uppercase">{t.nombre}</td>
                        <td className="text-muted small">{new Date(t.creado_en).toLocaleDateString()}</td>
                        <td className="text-center">
                          {permisos.editar && (
                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(t)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {permisos.eliminar && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposEquipos;
