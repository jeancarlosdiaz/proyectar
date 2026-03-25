import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import config from '../config';
const AmbulanciaDetalleV2 = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [detalle, setDetalle] = useState(null);
    const [downloadingZip, setDownloadingZip] = useState(false);

    const handleDownloadZip = async () => {
        setDownloadingZip(true);
        try {
            const response = await axios.get(
                `${config.apiUrl}/ambulancias/export_zip.php?id=${id}&t=${Date.now()}`,
                { withCredentials: true, responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
            const link = document.createElement('a');
            link.href = url;
            const disposition = response.headers['content-disposition'];
            let filename = `Expediente_Ambulancia_${id}.zip`;
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

    useEffect(() => {
        const fetchDetalle = async () => {
            try {
                const { data } = await axios.get(`${config.apiUrl}/ambulancias/get_details.php?id=${id}`, { withCredentials: true });
                setDetalle(data);
            } catch (error) {
                console.error('Error al cargar detalles', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetalle();
    }, [id]);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;
    if (!detalle) return <div className="alert alert-danger m-4">No se pudo cargar la información de la ambulancia.</div>;

    const { info, personal, equipos } = detalle;

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h2 className="mb-0 fw-bold text-primary-institucional">
                    <i className="bi bi-truck me-2"></i> Expediente de Ambulancia
                </h2>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary-institucional btn-sm"
                        onClick={handleDownloadZip}
                        disabled={downloadingZip}
                        title="Descargar expediente completo con equipos y archivos"
                    >
                        {downloadingZip ? (
                            <><span className="spinner-border spinner-border-sm me-1"></span> Generando...</>
                        ) : (
                            <><i className="bi bi-file-zip me-1"></i> Descargar ZIP</>
                        )}
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/ambulancias')}>
                        <i className="bi bi-arrow-left me-1"></i> Volver a la Lista
                    </button>
                </div>
            </div>


            <div className="row g-4">
                {/* Panel Lateral: Info Básica */}
                <div className="col-lg-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body text-center py-5">
                            <div className="bg-primary-institucional text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                                <i className="bi bi-truck fs-1"></i>
                            </div>
                            <h3 className="fw-bold mb-0">Móvil {info.movil || '---'}</h3>
                            <div className="text-muted fs-5 mb-4">Placa: {info.placa}</div>
                            
                            <div className={`badge fs-6 px-4 py-2 mb-4 ${info.estado === 'Activa' ? 'bg-primary' : (info.estado === 'Inactiva' ? 'bg-secondary' : 'bg-warning text-dark')}`}>
                                {info.estado}
                            </div>

                            <div className="border-top pt-4 mt-2 text-start px-3">
                                <div className="mb-4">
                                    <label className="text-muted small d-block mb-1">Sede Operativa</label>
                                    <span className="fw-bold"><i className="bi bi-geo-alt me-1"></i> {info.sede_nombre} ({info.sede_ciudad})</span>
                                </div>
                                <div className="row g-3">
                                    {/* Helper para renderizar estado de documentos */}
                                    {(() => {
                                        const getStatusBadge = (fecha) => {
                                            if(!fecha) return { label: 'Sin Datos', class: 'bg-secondary' };
                                            const hoy = new Date();
                                            const vencimiento = new Date(fecha);
                                            const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                                            
                                            if (diff < 0) return { label: 'Vencido', class: 'bg-danger' };
                                            if (diff <= 15) return { label: 'Por Vencer', class: 'bg-warning text-dark' };
                                            return { label: 'Vigente', class: 'bg-success' };
                                        };

                                        const soatStatus = getStatusBadge(info.soat_vencimiento);
                                        const tecnoStatus = getStatusBadge(info.tecnomecanica_vencimiento);

                                        return (
                                            <>
                                                <div className="col-6 text-center border-end">
                                                    <label className="text-muted small d-block mb-1">SOAT Vence</label>
                                                    <span className="fw-bold d-block mb-1">{info.soat_vencimiento}</span>
                                                    <span className={`badge ${soatStatus.class} w-100 py-1`}>{soatStatus.label}</span>
                                                </div>
                                                <div className="col-6 text-center">
                                                    <label className="text-muted small d-block mb-1">Tecno Vence</label>
                                                    <span className="fw-bold d-block mb-1">{info.tecnomecanica_vencimiento}</span>
                                                    <span className={`badge ${tecnoStatus.class} w-100 py-1`}>{tecnoStatus.label}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cuerpo Principal: Personal y Equipos */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-people me-2 text-primary-institucional"></i> Personal Asignado</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre Completo</th>
                                            <th>Cargo</th>
                                            <th>Identificación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {personal.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-4 text-muted">No hay personal activo asignado.</td></tr>
                                        ) : (
                                            personal.map(p => (
                                                <tr key={p.id}>
                                                    <td className="fw-bold">{p.nombre}</td>
                                                    <td><span className="badge bg-light text-dark border">{p.cargo}</span></td>
                                                    <td className="text-muted small">{p.tipo_identificacion} {p.identificacion}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-heart-pulse me-2 text-primary-institucional"></i> Equipos Médicos en Unidad</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nombre del Equipo</th>
                                            <th>Marca / Modelo</th>
                                            <th>Serial / Placa</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equipos.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-4 text-muted">No hay equipos registrados en esta unidad.</td></tr>
                                        ) : (
                                            equipos.map(e => (
                                                <tr key={e.id}>
                                                    <td>
                                                        <div className="fw-bold">{e.nombre}</div>
                                                        <small className="text-primary-institucional text-uppercase fw-bold" style={{fontSize: '9px'}}>{e.tipo_nombre}</small>
                                                    </td>
                                                    <td>{e.marca} <span className="text-muted">/</span> {e.modelo}</td>
                                                    <td><code className="text-dark bg-light px-2 py-1 rounded border">{e.serie}</code></td>
                                                    <td className="text-end">
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 ms-auto"
                                                            onClick={() => window.open(`/equipo-hoja-vida/${e.id}`, '_blank')}
                                                        >
                                                            <i className="bi bi-file-earmark-medical"></i> Hoja de Vida
                                                        </button>
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

                {/* Documentación PDF */}
                <div className="col-12">
                     <div className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold"><i className="bi bi-file-earmark-pdf me-2 text-danger"></i> Expediente Digital (PDF)</h5>
                        </div>
                        <div className="card-body bg-light-subtle rounded-bottom">
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="p-3 bg-white rounded border">
                                        <h6 className="fw-bold mb-3 border-bottom pb-2">Seguro SOAT</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {info.soat_pdf ? info.soat_pdf.split(';').map((path, idx) => (
                                                <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark-pdf fs-5"></i>
                                                    <span className="fw-bold">Ver SOAT {idx + 1}</span>
                                                </a>
                                            )) : <span className="text-muted small italic">Sin documentos vinculados</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-white rounded border">
                                        <h6 className="fw-bold mb-3 border-bottom pb-2">Revisiones Tecnomecánicas</h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {info.tecnomecanica_pdf ? info.tecnomecanica_pdf.split(';').map((path, idx) => (
                                                <a key={idx} href={`${config.baseUrl}/${path}`} target="_blank" rel="noreferrer" className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark-pdf fs-5"></i>
                                                    <span className="fw-bold">Ver Revisión {idx + 1}</span>
                                                </a>
                                            )) : <span className="text-muted small italic">Sin documentos vinculados</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            
            <div className="text-center mt-5 mb-4 text-muted small">
                © {new Date().getFullYear()} - Sistema de Gestión Proyectar - Unidad Móvil {info.placa}
            </div>
        </div>
    );
};

export default AmbulanciaDetalleV2;
