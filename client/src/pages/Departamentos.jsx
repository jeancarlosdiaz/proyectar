import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Departamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [formDepto, setFormDepto] = useState({ id: '', nombre: '', sede_id: '' });
  const [editando, setEditando] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.departamentos || {});


  const fetchData = async () => {
    setLoading(true);
    try {
      const resDeptos = await axios.get('http://localhost/proyectar/api/departamentos/read.php', { withCredentials: true });
      setDepartamentos(Array.isArray(resDeptos.data) ? resDeptos.data : []);
      
      const resSedes = await axios.get('http://localhost/proyectar/api/sedes/read.php', { withCredentials: true });
      setSedes(Array.isArray(resSedes.data) ? resSedes.data : []);
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
        await axios.post('http://localhost/proyectar/api/departamentos/update.php', formDepto, { withCredentials: true });
      } else {
        await axios.post('http://localhost/proyectar/api/departamentos/create.php', formDepto, { withCredentials: true });
      }
      setFormDepto({ id: '', nombre: '', sede_id: '' });
      setEditando(false);
      fetchData();
    } catch (error) {
      alert('Error al guardar el departamento');
    }
  };
  
  const handleDownloadZip = async (id, nombre) => {
    setDownloadingZip(id);
    try {
        const response = await axios.get(
            `http://localhost/proyectar/api/departamentos/export_zip.php?id=${id}&t=${Date.now()}`,
            { withCredentials: true, responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        const disposition = response.headers['content-disposition'];
        let filename = `Expediente_Depto_${nombre.replace(/ /g, '_')}.zip`;
        if (disposition) {
            const match = disposition.match(/filename="(.+)"/);
            if (match) filename = match[1];
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert('Error al generar el expediente ZIP. Intente nuevamente.');
        console.error(error);
    } finally {
        setDownloadingZip(false);
    }
  };

  const handleEdit = (depto) => {
    setFormDepto({ id: depto.id, nombre: depto.nombre, sede_id: depto.sede_id });
    setEditando(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este departamento? Los equipos asociados quedarán sin departamento.')) {
      try {
        await axios.post('http://localhost/proyectar/api/departamentos/delete.php', { id }, { withCredentials: true });
        fetchData();
      } catch (error) {
        alert('Error al eliminar el departamento');
      }
    }
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="mb-4">Gestión de Departamentos Corporativos</h2>
      
      <div className="row">
        {permisos.crear && (
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">{editando ? 'Editar Departamento' : 'Nuevo Departamento'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre del Departamento</label>
                    <input type="text" className="form-control" value={formDepto.nombre} onChange={e => setFormDepto({...formDepto, nombre: e.target.value.toUpperCase()})} required placeholder="EJ: CONTABILIDAD" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sede de Pertenencia</label>
                    <select className="form-select" value={formDepto.sede_id} onChange={e => setFormDepto({...formDepto, sede_id: e.target.value})} required>
                      <option value="">-- Seleccionar Sede --</option>
                      {sedes.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.ciudad})</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary-institucional w-100">
                      {editando ? 'Actualizar' : 'Guardar'}
                    </button>
                    {editando && (
                      <button type="button" className="btn btn-outline-secondary w-100" onClick={() => {setEditando(false); setFormDepto({id:'', nombre:'', sede_id:''})}}>
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
                    <th>Departamento</th>
                    <th>Sede / Ubicación</th>
                    <th className="text-center">Equipos</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {departamentos.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">No hay departamentos registrados.</td></tr>
                  ) : (
                    departamentos.map(d => (
                      <tr key={d.id}>
                        <td className="fw-bold text-uppercase">{d.nombre}</td>
                        <td>
                            <span className="badge bg-light text-primary-institucional border">
                                <i className="bi bi-geo-alt me-1"></i> {d.sede_nombre}
                            </span>
                        </td>
                        <td className="text-center">
                            <span className={`badge ${d.total_equipos > 0 ? 'bg-info text-dark' : 'bg-light text-muted border'}`}>
                                <i className="bi bi-tools me-1"></i> {d.total_equipos}
                            </span>
                        </td>
                        <td className="text-center">
                          <button 
                            className={`btn btn-sm ${downloadingZip === d.id ? 'btn-secondary' : 'btn-outline-primary'} me-2`} 
                            onClick={() => handleDownloadZip(d.id, d.nombre)}
                            disabled={downloadingZip === d.id}
                            title="Descargar Expediente ZIP"
                          >
                            {downloadingZip === d.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-file-zip"></i>}
                          </button>
                          {permisos.editar && (
                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(d)}>
                                <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {permisos.eliminar && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(d.id)}>
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

export default Departamentos;
