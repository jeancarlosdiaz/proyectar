import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilePickerModal = ({ show, onHide, onSelect, title = "Seleccionar Archivo", multiple = false, selectedPaths = "" }) => {
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    if (show) {
      fetchArchivos();
      setFiltro('');
    }
  }, [show]);

  useEffect(() => {
    if (show && archivos.length > 0) {
      if (selectedPaths) {
        const currentPaths = selectedPaths.split(';');
        const preSelected = archivos.filter(a => currentPaths.includes(`uploads/${a.nombre_servidor}`));
        setSeleccionados(preSelected);
      } else {
        setSeleccionados([]);
      }
    }
  }, [show, archivos, selectedPaths]);

  const fetchArchivos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost/proyectar/api/archivos/read.php', { withCredentials: true });
      setArchivos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar archivos", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccion = (archivo) => {
    if (multiple) {
      if (seleccionados.find(s => s.id === archivo.id)) {
        setSeleccionados(seleccionados.filter(s => s.id !== archivo.id));
      } else {
        setSeleccionados([...seleccionados, archivo]);
      }
    } else {
      onSelect(archivo);
      onHide();
    }
  };

  const confirmarSeleccion = () => {
    onSelect(seleccionados);
    onHide();
  };

  const archivosFiltrados = archivos.filter(a => 
    (a.nombre_original || "").toLowerCase().includes(filtro.toLowerCase()) ||
    (a.subido_por || "").toLowerCase().includes(filtro.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg animate__animated animate__zoomIn animate__faster">
          <div className="modal-header bg-primary-institucional text-white">
            <h5 className="modal-title"><i className="bi bi-folder2-open me-2"></i> {title}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
          </div>
          <div className="modal-body p-0">
            <div className="p-3 bg-light border-bottom">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Buscar archivo por nombre o autor..." 
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
              {multiple && seleccionados.length > 0 && (
                <div className="mt-2 small text-primary fw-bold">
                  {seleccionados.length} archivos seleccionados
                </div>
              )}
            </div>
            
            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
              ) : (
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{width: '40px'}}></th>
                      <th>Nombre del Archivo</th>
                      <th>Tipo</th>
                      <th>Fecha de Subida</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivosFiltrados.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-4 text-muted">No se encontraron archivos.</td></tr>
                    ) : (
                      archivosFiltrados.map(a => {
                        const isSelected = seleccionados.find(s => s.id === a.id);
                        return (
                          <tr key={a.id} onClick={() => multiple && toggleSeleccion(a)} style={{cursor: multiple ? 'pointer' : 'default'}}>
                            <td>
                              {multiple ? (
                                <input type="checkbox" className="form-check-input" checked={!!isSelected} onChange={() => {}} />
                              ) : (
                                <i className={`bi fs-5 ${(a.tipo || "").includes('pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary'}`}></i>
                              )}
                            </td>
                            <td>
                              <div className="fw-bold text-truncate" style={{maxWidth: '250px'}} title={a.nombre_original}>{a.nombre_original}</div>
                              <small className="text-muted">Subido por: {a.subido_por || 'N/A'}</small>
                            </td>
                            <td>
                               <span className="badge bg-light text-dark border small">{(a.tipo || "").split('/')[1]?.toUpperCase() || 'FILE'}</span>
                            </td>
                            <td>
                                <small className="text-muted">{new Date(a.creado_en).toLocaleString()}</small>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <a href={`http://localhost/proyectar/uploads/${a.nombre_servidor}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" onClick={(e) => e.stopPropagation()}>
                                  <i className="bi bi-eye"></i> Ver
                                </a>
                                {!multiple && (
                                  <button className="btn btn-sm btn-primary-institucional" onClick={(e) => { e.stopPropagation(); onSelect(a); onHide(); }}>
                                    Seleccionar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onHide}>Cancelar</button>
            {multiple && (
              <button 
                type="button" 
                className="btn btn-primary-institucional" 
                onClick={confirmarSeleccion}
                disabled={seleccionados.length === 0}
              >
                Insertar {seleccionados.length} archivos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePickerModal;
