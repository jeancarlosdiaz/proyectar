import React, { useState } from 'react';
import axios from 'axios';

const QuickCreateTypeModal = ({ show, onHide, onSuccess }) => {
    const [nombre, setNombre] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) return;

        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost/proyectar/api/tipos_equipos/create.php', 
                { nombre: nombre.trim() }, 
                { withCredentials: true }
            );
            setNombre('');
            onSuccess();
            onHide();
        } catch (error) {
            console.error("Error al crear tipo:", error);
            alert("Error al crear la categoría. Verifique que no exista ya.");
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg animate__animated animate__fadeInUp animate__faster">
                    <div className="modal-header bg-primary-institucional text-white">
                        <h5 className="modal-title"><i className="bi bi-plus-circle me-2"></i> Nuevo Tipo de Equipo</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            <label className="form-label fw-bold">Nombre de la Categoría</label>
                            <input 
                                type="text" 
                                className="form-control text-uppercase" 
                                placeholder="Ej: DESFIBRILADOR, MONITOR, ETC." 
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                autoFocus
                                required
                            />
                            <p className="text-muted small mt-2">Este nombre aparecerá en la lista desplegable de equipos médicos.</p>
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>Cancelar</button>
                            <button type="submit" className="btn btn-primary-institucional" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                                Guardar Categoría
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QuickCreateTypeModal;
