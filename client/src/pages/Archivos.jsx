import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config';
const Archivos = () => {
    const [archivos, setArchivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const permisos = user?.rol === 'admin' ? { ver: true, crear: true, editar: true, eliminar: true } : (user?.permisos?.multimedia || {});

    const fetchArchivos = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${config.apiUrl}/archivos/read.php`, { withCredentials: true });
            setArchivos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchivos();
    }, []);

    const handleUpload = async (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('archivo[]', selectedFiles[i]);
        }

        try {
            await axios.post(`${config.apiUrl}/archivos/upload.php`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            fetchArchivos();
            e.target.value = null; // Limpiar input
        } catch (err) {
            setError(err.response?.data?.message || 'Error al subir los archivos');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este archivo permanentemente?')) {
            try {
                await axios.post(`${config.apiUrl}/archivos/delete.php`, { id }, { withCredentials: true });
                fetchArchivos();
            } catch (err) {
                alert('No se pudo eliminar el archivo');
            }
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type) => {
        if (type.includes('image')) return 'bi-file-earmark-image text-success';
        if (type.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
        if (type.includes('word') || type.includes('officedocument')) return 'bi-file-earmark-word text-primary';
        if (type.includes('excel') || type.includes('sheet')) return 'bi-file-earmark-excel text-success';
        return 'bi-file-earmark text-secondary';
    };

    const archivosFiltrados = archivos.filter(a => 
        a.nombre_original.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subido_por.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = archivosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(archivosFiltrados.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Resetear a página 1 cuando se busca
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Archivos Multimedia</h2>


                <div className="d-flex gap-3 align-items-center">
                    <div className="position-relative">
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                        <input 
                            type="text" 
                            className="form-control ps-5 border-0 shadow-sm" 
                            placeholder="Buscar archivo o autor..." 
                            style={{width: '300px'}}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {permisos.crear && (
                        <label className={`btn ${uploading ? 'btn-secondary disabled' : 'btn-primary-institucional shadow-sm'}`}>
                            {uploading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span> Subiendo...</>
                            ) : (
                                <><i className="bi bi-cloud-upload me-2"></i> Subir Archivo</>
                            )}
                            <input type="file" hidden onChange={handleUpload} disabled={uploading} multiple />
                        </label>
                    )}

                </div>
            </div>

            {error && <div className="alert alert-danger shadow-sm border-0">{error}</div>}

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Archivo</th>
                                    <th>Tipo</th>
                                    <th>Tamaño</th>
                                    <th>Subido Por</th>
                                    <th>Fecha</th>
                                    <th className="text-end pe-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary-institucional"></div></td></tr>
                                ) : currentItems.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No se encontraron archivos que coincidan con la búsqueda.</td></tr>
                                ) : (
                                    currentItems.map(archivo => (
                                        <tr key={archivo.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <i className={`bi ${getFileIcon(archivo.tipo)} fs-3 me-3`}></i>
                                                    <span className="fw-bold">{archivo.nombre_original}</span>
                                                </div>
                                            </td>
                                            <td>{(() => { const t = archivo.tipo.split('/')[1] || 'DOC'; return <small className="text-uppercase text-muted" title={t}>{t.length > 5 ? t.substring(0, 5) + '...' : t}</small>; })()}</td>
                                            <td>{formatSize(archivo.tamano)}</td>
                                            <td><span className="badge bg-light text-dark">{archivo.subido_por}</span></td>
                                            <td>{new Date(archivo.creado_en).toLocaleString()}</td>
                                            <td className="text-end pe-4">
                                                <a 
                                                    href={`http://localhost/proyectar/uploads/${archivo.nombre_servidor}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    download={archivo.nombre_original}
                                                >
                                                    <i className="bi bi-download"></i>
                                                </a>
                                                {permisos.eliminar && (
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(archivo.id)}>
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

                {totalPages > 1 && (
                    <div className="card-footer bg-white border-0 py-3">
                        <nav>
                            <ul className="pagination justify-content-center mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>Anterior</button>
                                </li>
                                {[...Array(totalPages).keys()].map(num => (
                                    <li key={num + 1} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(num + 1)}>{num + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>Siguiente</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Archivos;
