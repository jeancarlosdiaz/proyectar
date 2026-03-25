import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FilePickerModal from '../components/FilePickerModal';

import config from '../config';
const EquipoHojaVidaV2 = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [detalle, setDetalle] = useState(null);
    const [calibraciones, setCalibraciones] = useState([]);
    const [mantenimientos, setMantenimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formCalibracion, setFormCalibracion] = useState(false);
    const [formMantenimiento, setFormMantenimiento] = useState(false);
    const [calibData, setCalibData] = useState({
        fecha_calibracion: new Date().toISOString().split('T')[0],
        periodicidad_meses: 6,
        observaciones: '',
        documento_pdf: ''
    });
    const [mantData, setMantData] = useState({
        fecha_mantenimiento: new Date().toISOString().split('T')[0],
        tipo: 'preventivo',
        observaciones: '',
        soporte_pdf: ''
    });
    const [showFilePickerMant, setShowFilePickerMant] = useState(false);

    // Estados para el selector de archivos
    const [showFilePicker, setShowFilePicker] = useState(false);

    const fetchCalibraciones = async () => {
        try {
            const resCal = await axios.get(`${config.apiUrl}/calibraciones/read.php?equipo_id=${id}`, { withCredentials: true });
            setCalibraciones(Array.isArray(resCal.data) ? resCal.data : []);
        } catch (error) {
            console.error("Error cargando calibraciones", error);
        }
    };

    const fetchMantenimientos = async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/mantenimientos/read.php?equipo_id=${id}`, { withCredentials: true });
            setMantenimientos(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error cargando mantenimientos", error);
        }
    };

    useEffect(() => {
        const fetchDatos = async () => {
            setLoading(true);
            try {
                // Obtener info del equipo
                const resEq = await axios.get(`${config.apiUrl}/equipos/read.php?id=${id}`, { withCredentials: true });
                setDetalle(resEq.data);

                // Setear periodicidad por defecto del equipo
                if (resEq.data && resEq.data.periodicidad_meses) {
                    setCalibData(prev => ({ ...prev, periodicidad_meses: resEq.data.periodicidad_meses }));
                }

                // Obtener calibraciones y mantenimientos
                await fetchCalibraciones();
                await fetchMantenimientos();
            } catch (error) {
                console.error("Error cargando hoja de vida", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDatos();
    }, [id]);

    const handleCalibSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.apiUrl}/calibraciones/create.php`, {
                equipo_id: id,
                ...calibData,
                periodicidad_meses: detalle?.periodicidad_meses || 6
            }, { withCredentials: true });
            
            setFormCalibracion(false);
            setCalibData({
                fecha_calibracion: new Date().toISOString().split('T')[0],
                periodicidad_meses: detalle?.periodicidad_meses || 6,
                observaciones: '',
                documento_pdf: ''
            });
            fetchCalibraciones();
        } catch (error) {
            alert('Error registrando calibración');
        }
    };

    // Obtener rol del usuario
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.rol === 'admin';

    const handleDeleteCalib = async (calibId) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro de calibración? Esta acción no se puede deshacer.')) return;
        
        try {
            await axios.post(`${config.apiUrl}/calibraciones/delete.php`, { id: calibId }, { withCredentials: true });
            fetchCalibraciones();
        } catch (error) {
            alert('Error eliminando calibración: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleMantSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${config.apiUrl}/mantenimientos/create.php`, {
                equipo_id: id,
                ...mantData
            }, { withCredentials: true });
            setFormMantenimiento(false);
            setMantData({
                fecha_mantenimiento: new Date().toISOString().split('T')[0],
                tipo: 'preventivo',
                observaciones: '',
                soporte_pdf: ''
            });
            fetchMantenimientos();
        } catch (error) {
            alert('Error registrando mantenimiento');
        }
    };

    const handleDeleteMant = async (mantId) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro de mantenimiento? Esta acción no se puede deshacer.')) return;
        try {
            await axios.post(`${config.apiUrl}/mantenimientos/delete.php`, { id: mantId }, { withCredentials: true });
            fetchMantenimientos();
        } catch (error) {
            alert('Error eliminando mantenimiento: ' + (error.response?.data?.message || error.message));
        }
    };


    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div><p className="mt-2 text-muted">Cargando Hoja de Vida...</p></div>;
    if (!detalle) return <div className="alert alert-warning m-4">No se encontró información para este equipo.</div>;

    return (
        <div className="animate__animated animate__fadeIn pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h2 className="mb-0 fw-bold text-primary-institucional">
                    <i className="bi bi-file-earmark-medical me-2"></i> Hoja de Vida del Equipo
                </h2>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/equipos')}>
                    <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
                </button>
            </div>

            <div className="row g-4">
                {/* Columna Izquierda: Datos y Documentos */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-primary-institucional text-white d-flex align-items-center gap-3 py-3">
                            {detalle.imagen_url && (
                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '2px solid white' }} className="shadow-sm">
                                    <img src={`${config.baseUrl}/${detalle.imagen_url}`} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="Equipo" />
                                </div>
                            )}
                            <div>
                                <h5 className="mb-0 fw-bold">{detalle.nombre}</h5>
                                <small className="opacity-75">{detalle.tipo_nombre || 'Sin Categoría'}</small>
                            </div>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span className="text-muted small">Marca</span>
                                    <span className="fw-bold">{detalle.marca}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span className="text-muted small">Modelo</span>
                                    <span className="fw-bold">{detalle.modelo || 'N/A'}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span className="text-muted small">Serie / Placa</span>
                                    <span className="badge bg-dark fs-6">{detalle.serie}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span className="text-muted small">Ubicación Actual</span>
                                    <span className="fw-bold text-primary-institucional text-end" style={{ fontSize: '0.9rem' }}>
                                        {detalle.ambulancia_id ? 'Ambulancia Móvil ' + (detalle.ambulancia_movil || detalle.ambulancia_placa) : (detalle.depto_nombre ? detalle.depto_nombre : 'Bodega Central')}
                                        <div className="text-muted small fw-normal">{detalle.depto_sede_nombre}</div>
                                    </span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                    <span className="text-muted small">Fecha Registro</span>
                                    <span>{new Date(detalle.creado_en).toLocaleDateString()}</span>
                                </li>
                                <div className="d-flex flex-column text-end">
                                    <span className="text-muted small">Periodicidad Calibración</span>
                                    <span className="fw-bold">{detalle.periodicidad_meses || 6} Meses</span>
                                </div>
                            </ul>

                            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary-institucional">Documentación Técnica</h6>
                            <div className="d-grid gap-2">
                                {detalle.hoja_vida_pdf ? detalle.hoja_vida_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger text-start text-truncate">
                                        <i className="bi bi-file-person me-2"></i> Hoja de Vida {idx + 1}
                                    </a>
                                )) : <div className="small text-muted mb-2 ps-1">Hoja de Vida no disponible</div>}

                                {detalle.guia_uso_tipo === 'link' && detalle.guia_uso_url ? (
                                    <a href={detalle.guia_uso_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary text-start text-truncate">
                                        <i className="bi bi-link-45deg me-2"></i> Guía de Uso (Enlace)
                                    </a>
                                ) : detalle.guia_uso_tipo === 'documento' && detalle.guia_uso_pdf ? detalle.guia_uso_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger text-start text-truncate">
                                        <i className="bi bi-file-earmark-play me-2"></i> Guía de Uso {idx + 1}
                                    </a>
                                )) : <div className="small text-muted mb-2 ps-1">Guía de Uso no disponible</div>}

                                {detalle.manual_pdf ? detalle.manual_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger text-start text-truncate">
                                        <i className="bi bi-file-earmark-pdf me-2"></i> Manual de Usuario {idx + 1}
                                    </a>
                                )) : <div className="small text-muted mb-2 ps-1">Manual no disponible</div>}

                                {detalle.invima_pdf ? detalle.invima_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger text-start text-truncate">
                                        <i className="bi bi-shield-check me-2"></i> Registro INVIMA {idx + 1}
                                    </a>
                                )) : <div className="small text-muted mb-2 ps-1">INVIMA no disponible</div>}

                                {detalle.protocolos_pdf ? detalle.protocolos_pdf.split(';').map((path, idx) => (
                                    <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger text-start text-truncate">
                                        <i className="bi bi-droplet me-2"></i> Protocolo Limpieza {idx + 1}
                                    </a>
                                )) : <div className="small text-muted ps-1">Protocolos no disponibles</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Historial de Calibraciones + Mantenimientos */}
                <div className="col-lg-8">
                    <div className="d-flex flex-column gap-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-success">
                                <i className="bi bi-wrench-adjustable me-2"></i> Historial de Calibraciones
                            </h5>
                            <button className="btn btn-sm btn-success shadow-sm px-3" onClick={() => setFormCalibracion(!formCalibracion)}>
                                {formCalibracion ? <><i className="bi bi-x-lg me-1"></i> Cerrar</> : <><i className="bi bi-plus-lg me-1"></i> Registrar Calibración</>}
                            </button>
                        </div>

                        {formCalibracion && (
                            <div className="card-body border-bottom bg-light animate__animated animate__fadeInDown">
                                <form onSubmit={handleCalibSubmit} className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Fecha Realizada</label>
                                        <input type="date" className="form-control" value={calibData.fecha_calibracion} onChange={e => setCalibData({ ...calibData, fecha_calibracion: e.target.value })} required />
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label small fw-bold">Observaciones / Acciones</label>
                                        <input type="text" className="form-control" value={calibData.observaciones} onChange={e => setCalibData({ ...calibData, observaciones: e.target.value })} placeholder="Ej: Cambio de batería, calibración básica..." />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold d-block">Certificado de Calibración (PDF)</label>
                                        <div className="input-group">
                                            <button className={`btn ${calibData.documento_pdf ? 'btn-success' : 'btn-outline-primary'} w-100 text-truncate`} type="button" onClick={() => setShowFilePicker(true)}>
                                                <i className={`bi ${calibData.documento_pdf ? 'bi-check-circle-fill' : 'bi-file-earmark-pdf'} me-2`}></i>
                                                {calibData.documento_pdf ? calibData.documento_pdf.split('/').pop() : 'Adjuntar PDF'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12 text-end pt-2">
                                        <button type="submit" className="btn btn-primary-institucional px-4">
                                            Guardar Registro de Calibración
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Acción / Observaciones</th>
                                            <th>Certificado</th>
                                            <th>Próximo</th>
                                            {isAdmin && <th className="text-end">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calibraciones.length === 0 ? (
                                            <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-5 text-muted fst-italic">No hay calibraciones registradas aún.</td></tr>
                                        ) : (
                                            calibraciones.map((calib, index) => {
                                                const getStatusBadge = (proximaFecha) => {
                                                    const hoy = new Date();
                                                    hoy.setHours(0, 0, 0, 0);
                                                    const proxima = new Date(proximaFecha);
                                                    proxima.setHours(0, 0, 0, 0);

                                                    const diffDays = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));

                                                    if (diffDays < 0) return { label: 'Vencido', color: 'bg-danger' };
                                                    if (diffDays <= 15) return { label: 'A Vencer', color: 'bg-warning text-dark' };
                                                    if (diffDays <= 45) return { label: 'Próximo', color: 'bg-info text-dark' };
                                                    return { label: 'Activo', color: 'bg-success' };
                                                };

                                                const status = getStatusBadge(calib.proxima_fecha);
                                                
                                                return (
                                                    <tr key={calib.id}>
                                                        <td className="fw-bold">{calib.fecha_calibracion}</td>
                                                        <td>
                                                            <div className="small">{calib.observaciones || 'Calibracion de rutina'}</div>
                                                        </td>
                                                        <td>
                                                            {calib.documento_pdf ? (
                                                                <a href={`${config.baseUrl}/${calib.documento_pdf}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-danger shadow-sm">
                                                                    <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted small italic">Sin adjunto</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex flex-column align-items-center" style={{ minWidth: '100px' }}>
                                                                <span className="small fw-bold mb-1" style={{ fontSize: '11px' }}>{calib.proxima_fecha}</span>
                                                                <span className={`badge ${status.color} w-100 py-1 shadow-sm`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {isAdmin && (
                                                            <td className="text-end">
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCalib(calib.id)} title="Eliminar Registro">
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Mantenimientos */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold text-warning">
                                <i className="bi bi-tools me-2"></i> Historial de Mantenimientos
                            </h5>
                            <button className="btn btn-sm btn-warning shadow-sm px-3 text-dark" onClick={() => setFormMantenimiento(!formMantenimiento)}>
                                {formMantenimiento ? <><i className="bi bi-x-lg me-1"></i> Cerrar</> : <><i className="bi bi-plus-lg me-1"></i> Registrar Mantenimiento</>}
                            </button>
                        </div>

                        {formMantenimiento && (
                            <div className="card-body border-bottom bg-light animate__animated animate__fadeInDown">
                                <form onSubmit={handleMantSubmit} className="row g-3 align-items-end">
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Fecha Realizada</label>
                                        <input type="date" className="form-control" value={mantData.fecha_mantenimiento} onChange={e => setMantData({ ...mantData, fecha_mantenimiento: e.target.value })} required />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Tipo</label>
                                        <select className="form-select" value={mantData.tipo} onChange={e => setMantData({ ...mantData, tipo: e.target.value })} required>
                                            <option value="preventivo">Preventivo</option>
                                            <option value="correctivo">Correctivo</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold">Observaciones</label>
                                        <input type="text" className="form-control" value={mantData.observaciones} onChange={e => setMantData({ ...mantData, observaciones: e.target.value })} placeholder="Ej: Cambio de piezas, revisión general..." />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold d-block">Soporte (PDF)</label>
                                        <button className={`btn ${mantData.soporte_pdf ? 'btn-success' : 'btn-outline-secondary'} w-100 text-truncate`} type="button" onClick={() => setShowFilePickerMant(true)}>
                                            <i className={`bi ${mantData.soporte_pdf ? 'bi-check-circle-fill' : 'bi-file-earmark-pdf'} me-2`}></i>
                                            {mantData.soporte_pdf ? mantData.soporte_pdf.split('/').pop() : 'Adjuntar Soporte'}
                                        </button>
                                    </div>
                                    <div className="col-12 text-end pt-2">
                                        <button type="submit" className="btn btn-warning px-4 text-dark fw-bold">
                                            Guardar Mantenimiento
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Observaciones</th>
                                            <th>Soporte</th>
                                            {isAdmin && <th className="text-end">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mantenimientos.length === 0 ? (
                                            <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-5 text-muted fst-italic">No hay mantenimientos registrados aún.</td></tr>
                                        ) : (
                                            mantenimientos.map(mant => (
                                                <tr key={mant.id}>
                                                    <td className="fw-bold">{mant.fecha_mantenimiento}</td>
                                                    <td>
                                                        <span className={`badge py-2 px-3 ${mant.tipo === 'correctivo' ? 'bg-danger' : 'bg-success'}`}>
                                                            <i className={`bi ${mant.tipo === 'correctivo' ? 'bi-exclamation-triangle-fill' : 'bi-shield-check'} me-1`}></i>
                                                            {mant.tipo.charAt(0).toUpperCase() + mant.tipo.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td><div className="small">{mant.observaciones || <span className="text-muted fst-italic">Sin observaciones</span>}</div></td>
                                                    <td>
                                                        {mant.soporte_pdf ? (
                                                            <a href={`${config.baseUrl}/${mant.soporte_pdf}`} target="_blank" rel="noreferrer" className="btn btn-xs btn-outline-danger shadow-sm">
                                                                <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted small">Sin adjunto</span>
                                                        )}
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="text-end">
                                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteMant(mant.id)} title="Eliminar Registro">
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    </div>{/* fin d-flex flex-column */}
                </div>
            </div>


            <FilePickerModal
                show={showFilePickerMant}
                onHide={() => setShowFilePickerMant(false)}
                multiple={false}
                selectedPaths={mantData.soporte_pdf}
                onSelect={(archivo) => {
                    setMantData({ ...mantData, soporte_pdf: `uploads/${archivo.nombre_servidor}` });
                    setShowFilePickerMant(false);
                }}
                title="Seleccionar Soporte de Mantenimiento"
            />

            <FilePickerModal
                show={showFilePicker}
                onHide={() => setShowFilePicker(false)}
                multiple={false}
                selectedPaths={calibData.documento_pdf}
                onSelect={(archivo) => {
                    setCalibData({ ...calibData, documento_pdf: `uploads/${archivo.nombre_servidor}` });
                    setShowFilePicker(false);
                }}
                title="Seleccionar Certificado de Calibración"
            />
        </div>
    );
};

export default EquipoHojaVidaV2;
