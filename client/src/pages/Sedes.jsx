import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config';
const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formSede, setFormSede] = useState({ id: '', nombre: '', ciudad: '' });
  const [editando, setEditando] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.sedes || {});


  const fetchSedes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.apiUrl}/sedes/read.php`, { withCredentials: true });
      setSedes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.post(`${config.apiUrl}/sedes/update.php`, formSede, { withCredentials: true });
      } else {
        await axios.post(`${config.apiUrl}/sedes/create.php`, formSede, { withCredentials: true });
      }
      setFormSede({ id: '', nombre: '', ciudad: '' });
      setEditando(false);
      fetchSedes();
    } catch (error) {
      alert('Error al guardar la sede');
    }
  };

  const handleEdit = (sede) => {
    setFormSede(sede);
    setEditando(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta sede? Las ambulancias asociadas quedarán sin sede.')) {
      try {
        await axios.post(`${config.apiUrl}/sedes/delete.php`, { id }, { withCredentials: true });
        fetchSedes();
      } catch (error) {
        alert('Error al eliminar la sede');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="mb-4">Gestión de Sedes</h2>
      
      <div className="row">
        {permisos.crear && (
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">{editando ? 'Editar Sede' : 'Nueva Sede'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre de la Sede</label>
                    <input type="text" className="form-control" value={formSede.nombre} onChange={e => setFormSede({...formSede, nombre: e.target.value})} required placeholder="Ej: Sede Norte" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ciudad</label>
                    <input type="text" className="form-control" value={formSede.ciudad} onChange={e => setFormSede({...formSede, ciudad: e.target.value})} required placeholder="Ej: Valledupar" />
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary-institucional w-100">
                      {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editando && (
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={() => {setEditando(false); setFormSede({id:'', nombre:'', ciudad:''})}}>
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
                    <th>Nombre</th>
                    <th>Ciudad</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sedes.map(s => (
                    <tr key={s.id}>
                      <td className="fw-bold">{s.nombre}</td>
                      <td>{s.ciudad}</td>
                      <td className="text-center">
                        {permisos.editar && (
                          <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(s)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        {permisos.eliminar && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sedes;
