import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilePickerModal from '../components/FilePickerModal';

import config from '../config';
const Ambulancias = () => {
  const [ambulancias, setAmbulancias] = useState([]);
  const [sedes, setSedes] = useState([]); // Nuevo estado para sedes
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista'); // 'lista', 'formulario', 'detalle'
  const [ambulanciaDetalle, setAmbulanciaDetalle] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', placa: '', movil: '', sede_id: '', 
    soat_vencimiento: '', tecnomecanica_vencimiento: '', 
    estado: 'Activa', soat_pdf: '', tecnomecanica_pdf: '' 
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.ambulancias || {});


  const [showFilePicker, setShowFilePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('');

  const fetchAmbulancias = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${config.apiUrl}/ambulancias/read.php`, { withCredentials: true });
      setAmbulancias(Array.isArray(data) ? data : []);
      
      // También cargar las sedes para el selector
      const resSedes = await axios.get(`${config.apiUrl}/sedes/read.php`, { withCredentials: true });
      setSedes(Array.isArray(resSedes.data) ? resSedes.data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulancias();
  }, []);

  const handleEdit = (amb) => {
    setFormData(amb);
    setVista('formulario');
  };

  const handleVerDetalle = (id) => {
    window.open(`/ambulancia-detalle/${id}`, '_blank');
  };




  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta ambulancia?')) {
      try {
        await axios.post(`${config.apiUrl}/ambulancias/delete.php`, { id }, { withCredentials: true });
        fetchAmbulancias();
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
        await axios.post(`${config.apiUrl}/ambulancias/update.php`, formData, { withCredentials: true });
      } else {
        // Crear
        await axios.post(`${config.apiUrl}/ambulancias/create.php`, formData, { withCredentials: true });
      }
      setVista('lista');
      setFormData({ 
        id: '', placa: '', movil: '', sede_id: '', 
        soat_vencimiento: '', tecnomecanica_vencimiento: '', 
        estado: 'Activa', soat_pdf: '', tecnomecanica_pdf: '' 
      });
      fetchAmbulancias();
    } catch (error) {
      alert('Error en el formulario de la ambulancia.');
    }
  };

  const getDaysDiff = (dateStr) => {
    const timeDiff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  const getBadge = (dateStr) => {
    const days = getDaysDiff(dateStr);
    if (days < 0) return <span className="badge bg-danger">Vencido</span>;
    if (days <= 15) return <span className="badge bg-warning text-dark">Vence en {days} días</span>;
    return <span className="badge bg-success">Al Día</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestión de Ambulancias</h2>
        {permisos.crear && (
            <button className="btn btn-primary-institucional" onClick={() => {
                if (vista === 'formulario' || vista === 'detalle') {
                    setVista('lista');
                } else {
                    setFormData({ 
                        id: '', placa: '', movil: '', sede_id: '', 
                        soat_vencimiento: '', tecnomecanica_vencimiento: '', 
                        estado: 'Activa', soat_pdf: '', tecnomecanica_pdf: '' 
                    });
                    setVista('formulario');
                }
            }}>
            {vista !== 'lista' ? 'Volver a la Lista' : 'Nueva Ambulancia'}
            </button>
        )}
      </div>



      {vista === 'formulario' && (

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">{formData.id ? 'Editar Ambulancia' : 'Registrar Nueva Ambulancia'}</h5>
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Placa</label>
                <input type="text" className="form-control text-uppercase" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Móvil (Numérico)</label>
                <input type="number" min="1" className="form-control" value={formData.movil || ''} onChange={e => setFormData({...formData, movil: e.target.value})} placeholder="Ej: 15" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Venc. SOAT</label>
                <input type="date" className="form-control" value={formData.soat_vencimiento} onChange={e => setFormData({...formData, soat_vencimiento: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Venc. Tecnomecánica</label>
                <input type="date" className="form-control" value={formData.tecnomecanica_vencimiento} onChange={e => setFormData({...formData, tecnomecanica_vencimiento: e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Estado</label>
                <select className="form-select" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupada">Ocupada</option>
                  <option value="Calibración">Calibración</option>
                </select>
              </div>

              <h6 className="mt-4 mb-2 text-primary-institucional border-bottom pb-2">Documentación Digital (Adjuntar del Gestor)</h6>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Documento SOAT (Vigente)</label>
                <div className="input-group mb-2 shadow-sm">
                  <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('soat_pdf'); setShowFilePicker(true); }}>
                    <i className="bi bi-file-earmark-pdf"></i> Seleccionar
                  </button>
                  <input type="text" className="form-control" value={formData.soat_pdf || ''} readOnly placeholder="No hay archivo vinculado..." />
                </div>
                {formData.soat_pdf && formData.soat_pdf.split(';').map((path, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white animate__animated animate__fadeIn">
                    <i className="bi bi-file-earmark-pdf fs-4 text-danger"></i>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                      <div className="text-muted" style={{fontSize: '10px'}}>SOAT {idx + 1}</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                        onClick={() => {
                            const paths = formData.soat_pdf.split(';');
                            paths.splice(idx, 1);
                            setFormData({...formData, soat_pdf: paths.join(';')});
                        }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Documento Tecnomecánica</label>
                <div className="input-group mb-2 shadow-sm">
                  <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('tecnomecanica_pdf'); setShowFilePicker(true); }}>
                    <i className="bi bi-file-earmark-pdf"></i> Seleccionar
                  </button>
                  <input type="text" className="form-control" value={formData.tecnomecanica_pdf || ''} readOnly placeholder="No hay archivo vinculado..." />
                </div>
                {formData.tecnomecanica_pdf && formData.tecnomecanica_pdf.split(';').map((path, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white animate__animated animate__fadeIn">
                    <i className="bi bi-file-earmark-pdf fs-4 text-danger"></i>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                      <div className="text-muted" style={{fontSize: '10px'}}>TECNO {idx + 1}</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                        onClick={() => {
                            const paths = formData.tecnomecanica_pdf.split(';');
                            paths.splice(idx, 1);
                            setFormData({...formData, tecnomecanica_pdf: paths.join(';')});
                        }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                ))}
              </div>
              <div className="col-md-3">
                <label className="form-label text-primary-institucional fw-bold">Asignar Sede</label>
                <select className="form-select border-primary" value={formData.sede_id || ''} onChange={e => setFormData({...formData, sede_id: e.target.value})}>
                    <option value="">-- Sin sede asignada --</option>
                    {sedes.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre} ({s.ciudad})</option>
                    ))}
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
                  <th>Móvil / Placa</th>
                  <th>Ubicación</th>
                  <th>Personal</th>
                  <th>Equipos</th>
                  <th>Documentación legal (Vencimientos)</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ambulancias.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No hay ambulancias registradas.</td></tr>
                ) : (
                  ambulancias.map(amb => (
                    <tr key={amb.id}>
                      <td>
                        {amb.movil ? (
                            <div className="fw-bold fs-4 text-primary-institucional">Móvil {amb.movil}</div>
                        ) : (
                            <div className="text-muted italic small">Sin Móvil</div>
                        )}
                        <div className="text-muted small fw-bold">Placa: <span className="text-dark">{amb.placa}</span></div>
                      </td>
                      <td>
                        {amb.sede_nombre ? (
                            <span className="badge bg-light text-primary-institucional border">
                                <i className="bi bi-geo-alt-fill me-1"></i> {amb.sede_nombre}
                            </span>
                        ) : (
                            <span className="text-muted small italic">N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-people-fill text-secondary"></i>
                            <span className={`badge ${amb.total_personal > 0 ? 'bg-info text-dark' : 'bg-light text-muted border'}`}>
                                {amb.total_personal}
                            </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-tools text-secondary"></i>
                            <span className={`badge ${amb.total_equipos > 0 ? 'bg-info text-dark' : 'bg-light text-muted border'}`}>
                                {amb.total_equipos}
                            </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex align-items-center gap-2">
                             <div className="flex-grow-1">
                                <small className="fw-bold d-block">SOAT:</small>
                                <small>{amb.soat_vencimiento}</small>
                                {getBadge(amb.soat_vencimiento)}
                             </div>
                             <div className="d-flex flex-wrap gap-1" style={{maxWidth: '80px'}}>
                                {amb.soat_pdf && amb.soat_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`http://localhost/proyectar/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger p-1" title={`Ver SOAT ${idx + 1}`}>
                                        <i className="bi bi-file-earmark-pdf"></i>
                                    </a>
                                ))}
                             </div>
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-1 border-top pt-1">
                             <div className="flex-grow-1">
                                <small className="fw-bold d-block">TECNO:</small>
                                <small>{amb.tecnomecanica_vencimiento}</small>
                                {getBadge(amb.tecnomecanica_vencimiento)}
                             </div>
                             <div className="d-flex flex-wrap gap-1" style={{maxWidth: '80px'}}>
                                {amb.tecnomecanica_pdf && amb.tecnomecanica_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`http://localhost/proyectar/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger p-1" title={`Ver Tecno ${idx + 1}`}>
                                        <i className="bi bi-file-earmark-pdf"></i>
                                    </a>
                                ))}
                             </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${amb.estado === 'Activa' ? 'bg-primary' : (amb.estado === 'Inactiva' ? 'bg-secondary' : 'bg-warning text-dark')}`}>
                          {amb.estado}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleVerDetalle(amb.id)} title="Ver Detalle"><i className="bi bi-eye"></i></button>
                        {permisos.editar && <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(amb)}><i className="bi bi-pencil"></i></button>}
                        {permisos.eliminar && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(amb.id)}><i className="bi bi-trash"></i></button>}
                      </td>


                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FilePickerModal 
        show={showFilePicker} 
        onHide={() => setShowFilePicker(false)}
        multiple={true}
        selectedPaths={formData[pickerTarget]}
        onSelect={(archivosSelec) => {
          const nuevosPaths = Array.isArray(archivosSelec) 
                ? archivosSelec.map(a => `uploads/${a.nombre_servidor}`).join(';')
                : (archivosSelec ? `uploads/${archivosSelec.nombre_servidor}` : '');
          setFormData({...formData, [pickerTarget]: nuevosPaths});
        }}
        title={`Seleccionar ${pickerTarget.replace('_pdf', '').toUpperCase()}`}
      />
    </div>
  );
};

export default Ambulancias;
