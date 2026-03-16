import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilePickerModal from '../components/FilePickerModal';

import QuickCreateTypeModal from '../components/QuickCreateTypeModal';


const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [ambulancias, setAmbulancias] = useState([]); 
  const [departamentos, setDepartamentos] = useState([]);
  const [tipos, setTipos] = useState([]); // Nuevo estado para tipos
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista'); 
  const user = JSON.parse(localStorage.getItem('user'));
  const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.equipos || {});
  const [equipoActual, setEquipoActual] = useState({ 
    id: '', nombre: '', tipo_id: '', marca: '', modelo: '', serie: '', 
    manual_pdf: '', invima_pdf: '', protocolos_pdf: '', hoja_vida_pdf: '',
    guia_uso_tipo: 'ninguna', guia_uso_url: '', guia_uso_pdf: '',
    ambulancia_id: '', departamento_id: '', imagen_url: '',
    periodicidad_meses: 6
  });

  const [tipoUbicacion, setTipoUbicacion] = useState('ninguna');
  
  // Estado para calibraciones de la hoja de vida
  const [calibraciones, setCalibraciones] = useState([]);
  const [formCalibracion, setFormCalibracion] = useState(false);
  const [calibData, setCalibData] = useState({ fecha_calibracion: '', periodicidad_meses: 6, observaciones: '' });

  // Estado para el selector de archivos
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(''); // manual_pdf, invima_pdf, o protocolos_pdf

  // Estado para creación rápida de tipo
  const [showQuickType, setShowQuickType] = useState(false);


  const fetchTipos = async () => {
    try {
      const { data } = await axios.get('http://localhost/proyectar/api/tipos_equipos/read.php', { withCredentials: true });
      setTipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando tipos", error);
    }
  };

  const fetchEquipos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost/proyectar/api/equipos/read.php', { withCredentials: true });
      setEquipos(Array.isArray(data) ? data : []);
      
      // Cargar ambulancias
      const resAmb = await axios.get('http://localhost/proyectar/api/ambulancias/read.php', { withCredentials: true });
      setAmbulancias(Array.isArray(resAmb.data) ? resAmb.data : []);

      // Cargar departamentos
      const resDep = await axios.get('http://localhost/proyectar/api/departamentos/read.php', { withCredentials: true });
      setDepartamentos(Array.isArray(resDep.data) ? resDep.data : []);

      // Cargar tipos
      fetchTipos();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const fetchCalibraciones = async (equipo_id) => {
    try {
      const { data } = await axios.get(`http://localhost/proyectar/api/calibraciones/read.php?equipo_id=${equipo_id}`, { withCredentials: true });
      setCalibraciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando calibraciones", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const handleEdit = (equipo) => {
    setEquipoActual(equipo);
    if (equipo.ambulancia_id) setTipoUbicacion('ambulancia');
    else if (equipo.departamento_id) setTipoUbicacion('departamento');
    else setTipoUbicacion('ninguna');
    setVista('formulario');
  };

  const openHojaVida = (equipo) => {
    window.open(`/equipo-hoja-vida/${equipo.id}`, '_blank');
  };


  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este equipo y todo su historial de calibraciones?')) {
      try {
        await axios.post('http://localhost/proyectar/api/equipos/delete.php', { id }, { withCredentials: true });
        fetchEquipos();
      } catch (error) {
        alert('Error al eliminar el equipo');
      }
    }
  };

  const handleEquipoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (equipoActual.id) {
        await axios.post('http://localhost/proyectar/api/equipos/update.php', equipoActual, { withCredentials: true });
      } else {
        await axios.post('http://localhost/proyectar/api/equipos/create.php', equipoActual, { withCredentials: true });
      }
      setVista('lista');
      fetchEquipos();
    } catch (error) {
      alert('Error guardando equipo médico');
    }
  };

  const handleCalibSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost/proyectar/api/calibraciones/create.php', {
        equipo_id: equipoActual.id,
        ...calibData
      }, { withCredentials: true });
      
      setFormCalibracion(false);
      setCalibData({ fecha_calibracion: '', periodicidad_meses: 6, observaciones: '' });
      fetchCalibraciones(equipoActual.id);
    } catch (error) {
      alert('Error registrando calibración');
    }
  };

  const renderLista = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Inventario de Equipos Médicos</h2>
        {permisos.crear && (
            <button className="btn btn-primary-institucional" onClick={() => {
                setEquipoActual({ 
                    id: '', nombre: '', tipo_id: '', marca: '', modelo: '', serie: '', 
                    manual_pdf: '', invima_pdf: '', protocolos_pdf: '', hoja_vida_pdf: '',
                    guia_uso_tipo: 'ninguna', guia_uso_url: '', guia_uso_pdf: '',
                    ambulancia_id: '', departamento_id: '', imagen_url: '',
                    periodicidad_meses: 6
                });
                setTipoUbicacion('ninguna');
                setVista('formulario');
            }}>
            <i className="bi bi-plus-circle me-2"></i> Nuevo Equipo
            </button>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre del Equipo</th>
                <th>Marca / Serie</th>
                <th>Ubicación Actual</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equipos.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No hay equipos registrados.</td></tr>
              ) : (
                equipos.map(eq => (
                  <tr key={eq.id}>
                    <td className="fw-bold">
                        {eq.nombre}
                        <div className="text-primary-institucional small" style={{fontSize: '11px'}}>
                            {eq.tipo_nombre || 'Sin Categoría'}
                        </div>
                    </td>
                    <td>
                        <div className="small text-muted">{eq.marca}</div>
                        <span className="badge bg-light text-dark border px-2 py-1">{eq.serie}</span>
                    </td>
                    <td>
                        {eq.ambulancia_id ? (
                            <span className="badge bg-info text-dark">
                                <i className="bi bi-truck me-1"></i>
                                {eq.ambulancia_movil ? `Móvil ${eq.ambulancia_movil}` : eq.ambulancia_placa}
                            </span>
                        ) : (eq.departamento_id ? (
                            <div className="d-flex flex-column gap-1 align-items-start">
                                <span className="badge bg-secondary">
                                    <i className="bi bi-grid me-1"></i> {eq.depto_nombre}
                                </span>
                                <small className="text-muted" style={{fontSize: '10px'}}>{eq.depto_sede_nombre}</small>
                            </div>
                        ) : (
                            <span className="text-muted small italic">Sin asignar</span>
                        ))}
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-2" title="Hoja de Vida" onClick={() => openHojaVida(eq)}>
                        <i className="bi bi-journal-medical"></i> Hoja de Vida
                      </button>
                      {permisos.editar && (
                        <button className="btn btn-sm btn-outline-secondary me-2" title="Editar" onClick={() => handleEdit(eq)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                      {permisos.eliminar && (
                        <button className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => handleDelete(eq.id)}>
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
    </>
  );

  const renderFormulario = () => (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{equipoActual.id ? 'Editar Ficha de Equipo' : 'Registrar Nuevo Equipo'}</h5>
        <button className="btn btn-sm btn-close" onClick={() => setVista('lista')}></button>
      </div>
      <div className="card-body">
        <div className="row mb-4 align-items-center">
            <div className="col-auto">
                <div 
                    className="position-relative bg-light border d-flex align-items-center justify-content-center overflow-hidden shadow-sm"
                    style={{ width: '120px', height: '120px', borderRadius: '5px', cursor: 'pointer' }}
                    onClick={() => { setPickerTarget('imagen_url'); setShowFilePicker(true); }}
                >
                    {equipoActual.imagen_url ? (
                        <>
                            <img 
                                src={`http://localhost/proyectar/${equipoActual.imagen_url}`} 
                                alt="Perfil" 
                                className="w-100 h-100" 
                                style={{ objectFit: 'cover' }} 
                            />
                            <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute" 
                                style={{ top: '2px', right: '2px', padding: '0 5px', fontSize: '12px' }}
                                onClick={(e) => { e.stopPropagation(); setEquipoActual({...equipoActual, imagen_url: ''}); }}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        </>
                    ) : (
                        <div className="text-center text-muted">
                            <i className="bi bi-camera fs-1 d-block"></i>
                            <small style={{fontSize: '10px'}}>Foto Equipo</small>
                        </div>
                    )}
                </div>
            </div>
            <div className="col">
                <h6 className="mb-1 fw-bold text-primary-institucional">Foto de Identificación</h6>
                <p className="text-muted small mb-0">Seleccione una imagen para identificar visualmente el equipo en la hoja de vida.</p>
                {!equipoActual.imagen_url && (
                    <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => { setPickerTarget('imagen_url'); setShowFilePicker(true); }}>
                        Seleccionar Foto
                    </button>
                )}
            </div>
        </div>

        <form onSubmit={handleEquipoSubmit} className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Nombre del Equipo</label>
            <input type="text" className="form-control" value={equipoActual.nombre} onChange={e => setEquipoActual({...equipoActual, nombre: e.target.value})} required placeholder="Ej: DESFIBRILADOR" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Tipo / Categoría</label>
            <div className="input-group">
                <select className="form-select" value={equipoActual.tipo_id || ''} onChange={e => setEquipoActual({...equipoActual, tipo_id: e.target.value})} required>
                    <option value="">-- Seleccione --</option>
                    {tipos.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-outline-primary" 
                  title="Nueva Categoría"
                  onClick={() => setShowQuickType(true)}
                >
                    <i className="bi bi-plus-lg"></i>
                </button>
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Marca</label>
            <input type="text" className="form-control" value={equipoActual.marca} onChange={e => setEquipoActual({...equipoActual, marca: e.target.value})} required placeholder="Ej: MINDRAY" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Modelo</label>
            <input type="text" className="form-control" value={equipoActual.modelo || ''} onChange={e => setEquipoActual({...equipoActual, modelo: e.target.value})} placeholder="Ej: VITA 12" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Número de Serie</label>
            <input type="text" className="form-control text-uppercase" value={equipoActual.serie} onChange={e => setEquipoActual({...equipoActual, serie: e.target.value})} required />
          </div>
          <div className="col-md-3">
            <label className="form-label text-primary-institucional fw-bold">Periodicidad Calibración</label>
            <div className="input-group">
                <input type="number" min="1" max="24" className="form-control" value={equipoActual.periodicidad_meses} onChange={e => setEquipoActual({...equipoActual, periodicidad_meses: e.target.value})} required />
                <span className="input-group-text">Meses</span>
            </div>
          </div>

          
          <h6 className="mt-4 mb-2 text-primary-institucional border-bottom pb-2">Rutas de Documentación Técnica</h6>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label text-primary-institucional fw-bold small">Hoja de Vida</label>
              <div className="input-group mb-2 shadow-sm">
                <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('hoja_vida_pdf'); setShowFilePicker(true); }}>
                  <i className="bi bi-file-person"></i>
                </button>
                <input type="text" className="form-control border-start-0" value={equipoActual.hoja_vida_pdf || ''} readOnly placeholder="Seleccionar hoja..." />
              </div>
              {equipoActual.hoja_vida_pdf && equipoActual.hoja_vida_pdf.split(';').map((path, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white shadow-sm animate__animated animate__fadeIn">
                  <i className={`bi fs-4 ${path.endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary'}`}></i>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                    <div className="text-muted" style={{fontSize: '10px'}}>Hoja {idx + 1}</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                    onClick={() => {
                      const paths = equipoActual.hoja_vida_pdf.split(';');
                      paths.splice(idx, 1);
                      setEquipoActual({...equipoActual, hoja_vida_pdf: paths.join(';')});
                    }} 
                    title="Desvincular">
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="col-md-3">
              <label className="form-label text-primary-institucional fw-bold small">Manual de Usuario</label>
              <div className="input-group mb-2 shadow-sm">
                <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('manual_pdf'); setShowFilePicker(true); }}>
                  <i className="bi bi-file-earmark-pdf"></i>
                </button>
                <input type="text" className="form-control border-start-0" value={equipoActual.manual_pdf || ''} readOnly placeholder="Seleccionar manual..." />
              </div>
              {equipoActual.manual_pdf && equipoActual.manual_pdf.split(';').map((path, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white shadow-sm animate__animated animate__fadeIn">
                  <i className={`bi fs-4 ${path.endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary'}`}></i>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                    <div className="text-muted" style={{fontSize: '10px'}}>Manual {idx + 1}</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                    onClick={() => {
                      const paths = equipoActual.manual_pdf.split(';');
                      paths.splice(idx, 1);
                      setEquipoActual({...equipoActual, manual_pdf: paths.join(';')});
                    }} 
                    title="Desvincular">
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="col-md-3">
              <label className="form-label text-primary-institucional fw-bold small">Registro INVIMA</label>
              <div className="input-group mb-2 shadow-sm">
                <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('invima_pdf'); setShowFilePicker(true); }}>
                  <i className="bi bi-shield-check"></i>
                </button>
                <input type="text" className="form-control border-start-0" value={equipoActual.invima_pdf || ''} readOnly placeholder="Seleccionar registro..." />
              </div>
              {equipoActual.invima_pdf && equipoActual.invima_pdf.split(';').map((path, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white shadow-sm animate__animated animate__fadeIn">
                  <i className={`bi fs-4 ${path.endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary'}`}></i>
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                    <div className="text-muted" style={{fontSize: '10px'}}>INVIMA {idx + 1}</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                    onClick={() => {
                      const paths = equipoActual.invima_pdf.split(';');
                      paths.splice(idx, 1);
                      setEquipoActual({...equipoActual, invima_pdf: paths.join(';')});
                    }} 
                    title="Desvincular">
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="col-md-3">
              <label className="form-label text-primary-institucional fw-bold small">Protocolos Limpieza</label>
              <div className="input-group mb-2 shadow-sm">
                <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('protocolos_pdf'); setShowFilePicker(true); }}>
                  <i className="bi bi-droplet"></i>
                </button>
                <input type="text" className="form-control border-start-0" value={equipoActual.protocolos_pdf || ''} readOnly placeholder="Seleccionar protocolo..." />
              </div>
            {equipoActual.protocolos_pdf && equipoActual.protocolos_pdf.split(';').map((path, idx) => (
              <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white shadow-sm animate__animated animate__fadeIn">
                <i className={`bi fs-4 ${path.endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary'}`}></i>
                <div className="flex-grow-1 overflow-hidden">
                  <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                  <div className="text-muted" style={{fontSize: '10px'}}>Protocolo {idx + 1}</div>
                </div>
                <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                  onClick={() => {
                    const paths = equipoActual.protocolos_pdf.split(';');
                    paths.splice(idx, 1);
                    setEquipoActual({...equipoActual, protocolos_pdf: paths.join(';')});
                  }} 
                  title="Desvincular">
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="col-md-3">
              <label className="form-label text-primary-institucional fw-bold small">Tipo de Guía de Uso</label>
              <select className="form-select border-primary shadow-sm" value={equipoActual.guia_uso_tipo || 'ninguna'} onChange={e => setEquipoActual({...equipoActual, guia_uso_tipo: e.target.value})}>
                <option value="ninguna">Sin guía de uso</option>
                <option value="link">Link (Video / Enlace Web)</option>
                <option value="documento">Documento (PDF / Archivo)</option>
              </select>
          </div>
          </div>
          <div className="row g-3 mt-1">            
            {equipoActual.guia_uso_tipo === 'link' && (
              <div className="col-md-12 animate__animated animate__fadeIn">
                <label className="form-label text-primary-institucional fw-bold small">Enlace Web (URL)</label>
                <input type="url" className="form-control shadow-sm" value={equipoActual.guia_uso_url || ''} onChange={e => setEquipoActual({...equipoActual, guia_uso_url: e.target.value})} placeholder="Ej: https://youtube.com/watch?v=..." />
              </div>
            )}

            {equipoActual.guia_uso_tipo === 'documento' && (
              <div className="col-md-12 animate__animated animate__fadeIn">
                <label className="form-label text-primary-institucional fw-bold small">Documento de Guía</label>
                <div className="input-group mb-2 shadow-sm">
                  <button className="btn btn-outline-primary-institucional" type="button" onClick={() => { setPickerTarget('guia_uso_pdf'); setShowFilePicker(true); }}>
                    <i className="bi bi-file-earmark-play"></i> Seleccionar
                  </button>
                  <input type="text" className="form-control border-start-0" value={equipoActual.guia_uso_pdf || ''} readOnly placeholder="Seleccionar guía..." />
                </div>
                {equipoActual.guia_uso_pdf && equipoActual.guia_uso_pdf.split(';').map((path, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-2 p-2 mt-1 rounded border bg-white shadow-sm animate__animated animate__fadeIn">
                    <i className={`bi fs-4 ${path.endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-play text-primary'}`}></i>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="text-truncate fw-bold small">{path.split('/').pop()}</div>
                      <div className="text-muted" style={{fontSize: '10px'}}>Guía {idx + 1}</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-danger p-0" 
                      onClick={() => {
                        const paths = equipoActual.guia_uso_pdf.split(';');
                        paths.splice(idx, 1);
                        setEquipoActual({...equipoActual, guia_uso_pdf: paths.join(';')});
                      }} 
                      title="Desvincular">
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <h6 className="mt-4 mb-2 text-primary-institucional border-bottom pb-2">Asignación de Ubicación (Exclusiva)</h6>
          <div className="col-md-4">
            <label className="form-label">Tipo de Ubicación</label>
            <select className="form-select" value={tipoUbicacion} onChange={e => {
                const val = e.target.value;
                setTipoUbicacion(val);
                // Resetear campos según selección
                if (val === 'ninguna') setEquipoActual({...equipoActual, ambulancia_id: '', departamento_id: ''});
                else if (val === 'ambulancia') setEquipoActual({...equipoActual, departamento_id: ''});
                else if (val === 'departamento') setEquipoActual({...equipoActual, ambulancia_id: ''});
            }}>
                <option value="ninguna">Sin Asignar / En Bodega Central</option>
                <option value="ambulancia">Asignar a Ambulancia</option>
                <option value="departamento">Asignar a Departamento Corporativo</option>
            </select>
          </div>

          {tipoUbicacion === 'ambulancia' && (
            <div className="col-md-4 animate__animated animate__fadeIn">
               <label className="form-label text-primary-institucional fw-bold">Seleccionar Ambulancia</label>
               <select className="form-select border-primary" value={equipoActual.ambulancia_id || ''} onChange={e => setEquipoActual({...equipoActual, ambulancia_id: e.target.value})}>
                    <option value="">-- Seleccione Ambulancia --</option>
                    {ambulancias.map(a => (
                        <option key={a.id} value={a.id}>{a.movil ? 'Móvil '+a.movil : a.placa} {a.movil ? '('+a.placa+')' : ''}</option>
                    ))}
               </select>
            </div>
          )}

          {tipoUbicacion === 'departamento' && (
            <div className="col-md-4 animate__animated animate__fadeIn">
               <label className="form-label text-primary-institucional fw-bold">Asignar a Departamento Oficial</label>
               <select className="form-select border-primary" value={equipoActual.departamento_id || ''} onChange={e => setEquipoActual({...equipoActual, departamento_id: e.target.value})}>
                    <option value="">-- Seleccione Departamento --</option>
                    {departamentos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre} ({d.sede_nombre})</option>
                    ))}
               </select>
            </div>
          )}

          <div className="col-12 mt-4 text-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setVista('lista')}>Cancelar</button>
            <button type="submit" className="btn btn-primary-institucional">Guardar Ficha Técnica</button>
          </div>
        </form>
      </div>
    </div>
  );



  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  return (
    <div className="equipos-container">
      {vista === 'lista' && renderLista()}
      {vista === 'formulario' && renderFormulario()}


      <FilePickerModal 
        show={showFilePicker} 
        onHide={() => setShowFilePicker(false)}
        multiple={pickerTarget !== 'imagen_url'}
        selectedPaths={equipoActual[pickerTarget]}
        onSelect={(archivosSelec) => {
          // Si es múltiple, archivosSelec es un array. Si no, es un objeto solo.
          // Pero mi modal actualizado siempre devuelve array si multiple={true}.
          const nuevosPaths = Array.isArray(archivosSelec) 
                ? archivosSelec.map(a => `uploads/${a.nombre_servidor}`).join(';')
                : `uploads/${archivosSelec.nombre_servidor}`;
          
          // Concatenar con los existentes o reemplazar? El usuario dijo "seleccionar uno o varios".
          // Vamos a reemplazar/setear lo seleccionado.
          setEquipoActual({...equipoActual, [pickerTarget]: nuevosPaths});
        }}
        title={`Seleccionar Archivos para ${pickerTarget.replace('_pdf', '').toUpperCase()}`}
      />

      <QuickCreateTypeModal 
        show={showQuickType}
        onHide={() => setShowQuickType(false)}
        onSuccess={fetchTipos}
      />
    </div>

  );
};

export default Equipos;
