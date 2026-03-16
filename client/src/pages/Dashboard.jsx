import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState({
    total_ambulancias: 0,
    total_equipos: 0,
    calibraciones_vencidas: [],
    calibraciones_alertas: [],
    documentos_vencidos: { soat: 0, tecno: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get('http://localhost/proyectar/api/dashboard/summary.php', { withCredentials: true });
        setData(data);
      } catch (error) {
        console.error('Error al cargar resumen', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary-institucional"></div></div>;

  return (
    <div className="animate__animated animate__fadeIn">
      <h2 className="mb-4 fw-bold text-primary-institucional">Panel de Control</h2>
      
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <h6 className="text-muted small text-uppercase fw-bold">Ambulancias</h6>
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold">{data.total_ambulancias}</h2>
                <i className="bi bi-truck ms-auto fs-1 text-primary-institucional opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-info border-4">
            <div className="card-body">
              <h6 className="text-muted small text-uppercase fw-bold">Equipos Médicos</h6>
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold">{data.total_equipos}</h2>
                <i className="bi bi-tools ms-auto fs-1 text-info opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-danger border-4">
            <div className="card-body">
              <h6 className="text-muted small text-uppercase fw-bold">SOAT Vencidos</h6>
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold text-danger">{data.documentos_vencidos.soat}</h2>
                <i className="bi bi-file-earmark-pdf ms-auto fs-1 text-danger opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 border-start border-warning border-4">
            <div className="card-body">
              <h6 className="text-muted small text-uppercase fw-bold">Tecno Vencidos</h6>
              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold text-warning">{data.documentos_vencidos.tecno}</h2>
                <i className="bi bi-shield-exclamation ms-auto fs-1 text-warning opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Alertas de Calibraciones Pendientes (Historial Próximo) */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 text-danger"><i className="bi bi-wrench-adjustable me-2"></i> Calibraciones Pendientes</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {data.calibraciones_alertas.length === 0 ? (
                  <div className="p-4 text-center text-muted">Todos los equipos están al día con sus calibraciones.</div>
                ) : (
                  data.calibraciones_alertas.map(calib => (
                    <div 
                      key={calib.id} 
                      className="list-group-item list-group-item-action p-3 border-bottom cursor-pointer" 
                      onClick={() => window.open(`/equipo-hoja-vida/${calib.equipo_id}`, '_blank')}
                      style={{cursor: 'pointer'}}
                    >
                      <div className="d-flex w-100 justify-content-between align-items-center">
                        <strong className="fs-5 text-truncate" style={{maxWidth: '80%'}}>
                          {calib.equipo_nombre} {calib.serie && <span className="text-muted fw-normal fs-6 ms-2">(Serie: {calib.serie})</span>}
                        </strong>
                        <i className="bi bi-box-arrow-up-right text-muted"></i>
                      </div>
                      <div className="mt-2">
                         <span className="badge bg-warning text-dark border border-warning p-2">
                           <i className="bi bi-calendar-event me-2"></i>
                           Próxima: {calib.proxima_fecha}
                         </span>
                         <span className="ms-3 badge bg-light text-dark border">
                           {calib.ubicacion}
                         </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Gestión de Próximas Calibraciones */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-bold"><i className="bi bi-tools me-2 text-warning"></i> Próximas Calibraciones (Vencimiento)</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Equipo Médico</th>
                      <th>Ubicación</th>
                      <th>Fecha Calibración</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.calibraciones_vencidas.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">No hay calibraciones vencidas.</td></tr>
                    ) : (
                      data.calibraciones_vencidas.map(m => {
                        const getStatusBadge = (fecha) => {
                          const hoy = new Date();
                          const venc = new Date(fecha);
                          const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
                          if (diff < 0) return <span className="badge bg-danger">Vencido</span>;
                          if (diff <= 15) return <span className="badge bg-warning text-dark">Por Vencer</span>;
                          return <span className="badge bg-success">Vigente</span>;
                        };
                        return (
                          <tr key={m.id} style={{cursor: 'pointer'}} onClick={() => window.open(`/equipo-hoja-vida/${m.equipo_id}`, '_blank')}>
                            <td className="fw-bold">{m.nombre}</td>
                            <td>{m.ubicacion}</td>
                            <td>{m.proxima_fecha}</td>
                            <td>{getStatusBadge(m.proxima_fecha)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
