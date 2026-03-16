import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Auditoria = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditoria = async () => {
    try {
      const { data } = await axios.get('http://localhost/proyectar/api/auditoria/read.php', { withCredentials: true });
      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response && error.response.status === 403) {
         setRegistros([{ error: "Acceso denegado. Se requiere rol de administrador." }]);
      } else {
         console.error("Error cargando auditoría", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditoria();
  }, []);

  const formatearFecha = (fechaTimestamp) => {
    if (!fechaTimestamp) return '';
    const fecha = new Date(fechaTimestamp);
    return fecha.toLocaleString('es-CO');
  };

  const RenderizarDetalle = ({ valor }) => {
     if (!valor) return <span className="text-muted fst-italic">N/A</span>;
     
     // Removemos campos sensibles o muy ruidosos si se desea (ej: id, o passwords)
     const renderDict = Object.entries(valor).map(([k, v]) => {
         if (v === null || v === '') return null;
         if (k === 'password_hash') return null;
        return (
          <div key={k} className="text-truncate" style={{maxWidth: '200px', fontSize: '11px'}} title={`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`}>
            <b>{k}:</b> {typeof v === 'object' ? JSON.stringify(v) : v}
          </div>
        );
     });

     return <div>{renderDict}</div>;
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  if (registros.length === 1 && registros[0].error) {
     return <div className="alert alert-danger shadow-sm mt-4"><i className="bi bi-shield-lock me-2"></i> {registros[0].error}</div>;
  }

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-clock-history me-2 text-primary-institucional"></i> Historial del Sistema (Auditoría)</h2>
        <button className="btn btn-outline-secondary" onClick={fetchAuditoria} title="Recargar">
          <i className="bi bi-arrow-clockwise"></i> Recargar
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive" style={{maxHeight: '75vh', overflowY: 'auto'}}>
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{minWidth: '130px'}}>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>ID Registro</th>
                  <th style={{minWidth: '220px'}}>Estado Anterior</th>
                  <th style={{minWidth: '220px'}}>Estado Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No hay registros de auditoría disponibles.</td></tr>
                ) : (
                  registros.map(reg => (
                    <tr key={reg.id}>
                      <td className="small text-muted">{formatearFecha(reg.creado_en)}</td>
                      <td>
                        <div className="fw-bold fs-6">{reg.usuario_nombre}</div>
                        <div className="text-muted" style={{fontSize: '11px'}}>{reg.usuario_email}</div>
                      </td>
                      <td className="text-uppercase small fw-bold text-secondary">{reg.tabla_afectada}</td>
                      <td>
                         <span className={`badge ${
                           reg.accion === 'CREATE' ? 'bg-success' : 
                           (reg.accion === 'UPDATE' ? 'bg-warning text-dark' : 
                           (reg.accion === 'DELETE' ? 'bg-danger' : 'bg-info'))
                         }`}>
                           {reg.accion}
                         </span>
                      </td>
                      <td className="text-center"><span className="badge bg-light text-dark border">{reg.registro_id || '-'}</span></td>
                      <td className="border-end"><RenderizarDetalle valor={reg.valor_anterior} /></td>
                      <td><RenderizarDetalle valor={reg.valor_nuevo} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
