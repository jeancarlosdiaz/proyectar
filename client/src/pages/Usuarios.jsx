import React, { useState, useEffect } from 'react';
import axios from 'axios';

import config from '../config';
const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vista, setVista] = useState('lista');
    const [usuarioActual, setUsuarioActual] = useState({
        id: '', nombre: '', email: '', password: '', cargo: '', rol: 'operador',
        permisos: {
            ambulancias: { ver: true, crear: false, editar: false, eliminar: false },
            equipos: { ver: true, crear: false, editar: false, eliminar: false },
            personal: { ver: true, crear: false, editar: false, eliminar: false },
            multimedia: { ver: true, crear: false, editar: false, eliminar: false },
            sedes: { ver: true, crear: false, editar: false, eliminar: false },
            tipos_equipos: { ver: true, crear: false, editar: false, eliminar: false },
            departamentos: { ver: true, crear: false, editar: false, eliminar: false }
        }
    });



    const modulos = [
        { id: 'ambulancias', label: 'Ambulancias', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'equipos', label: 'Equipos Médicos', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'personal', label: 'Personal', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'multimedia', label: 'Multimedia', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'sedes', label: 'Sedes', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'tipos_equipos', label: 'Tipos de Equipos', acciones: ['crear', 'editar', 'eliminar'] },
        { id: 'departamentos', label: 'Departamentos', acciones: ['crear', 'editar', 'eliminar'] }
    ];




    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${config.apiUrl}/usuarios/read.php`, { withCredentials: true });
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando usuarios", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handlePermisoChange = (moduloId, accion) => {
        const nuevosPermisos = { ...usuarioActual.permisos };
        nuevosPermisos[moduloId][accion] = !nuevosPermisos[moduloId][accion];
        setUsuarioActual({ ...usuarioActual, permisos: nuevosPermisos });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (usuarioActual.id) {
                await axios.post(`${config.apiUrl}/usuarios/update.php`, usuarioActual, { withCredentials: true });
            } else {
                await axios.post(`${config.apiUrl}/usuarios/create.php`, usuarioActual, { withCredentials: true });
            }
            setVista('lista');
            fetchUsuarios();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleEdit = (user) => {
        // Cargar permisos completos del usuario
        axios.get(`${config.apiUrl}/usuarios/read.php?id=${user.id}`, { withCredentials: true })
            .then(({ data }) => {
                setUsuarioActual({
                    ...data,
                    password: '', // No cargar la contraseña por seguridad
                    permisos: data.permisos || usuarioActual.permisos // Fallback si no tiene permisos definidos
                });
                setVista('formulario');
            });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await axios.post(`${config.apiUrl}/usuarios/delete.php`, { id }, { withCredentials: true });
                fetchUsuarios();
            } catch (error) {
                alert(error.response?.data?.message || 'Error al eliminar usuario');
            }
        }
    };

    const renderLista = () => (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Gestión de Usuarios</h2>
                <button className="btn btn-primary-institucional" onClick={() => {
                                        setUsuarioActual({
                                            id: '', nombre: '', email: '', password: '', cargo: '', rol: 'operador',
                                            permisos: {
                                                ambulancias: { ver: true, crear: false, editar: false, eliminar: false },
                                                equipos: { ver: true, crear: false, editar: false, eliminar: false },
                                                personal: { ver: true, crear: false, editar: false, eliminar: false },
                                                multimedia: { ver: true, crear: false, editar: false, eliminar: false },
                                                sedes: { ver: true, crear: false, editar: false, eliminar: false },
                                                tipos_equipos: { ver: true, crear: false, editar: false, eliminar: false },
                                                departamentos: { ver: true, crear: false, editar: false, eliminar: false }
                                            }
                                        });



                    setVista('formulario');
                }}>
                    <i className="bi bi-person-plus me-2"></i> Nuevo Usuario
                </button>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Nombre / Cargo</th>
                                <th>Correo Electrónico</th>
                                <th>Rol</th>
                                <th>Fecha Registro</th>
                                <th className="text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No hay usuarios registrados.</td></tr>
                            ) : (
                                usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{u.nombre}</div>
                                            <div className="text-muted small">{u.cargo || 'Sin cargo'}</div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.rol === 'admin' ? 'bg-primary' : 'bg-info text-dark'}`}>
                                                {u.rol?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{new Date(u.creado_en).toLocaleDateString()}</td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(u)}>
                                                <i className="bi bi-shield-lock me-1"></i> Permisos
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id)}>
                                                <i className="bi bi-trash"></i>
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
    );

    const renderFormulario = () => (
        <div className="animate__animated animate__fadeIn">
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-primary-institucional">
                        {usuarioActual.id ? 'Editar Usuario y Permisos' : 'Registrar Nuevo Usuario'}
                    </h5>
                    <button className="btn-close" onClick={() => setVista('lista')}></button>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nombre Completo</label>
                                <input type="text" className="form-control" value={usuarioActual.nombre} onChange={e => setUsuarioActual({...usuarioActual, nombre: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Correo Electrónico</label>
                                <input type="email" className="form-control" value={usuarioActual.email} onChange={e => setUsuarioActual({...usuarioActual, email: e.target.value})} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Cargo</label>
                                <input type="text" className="form-control" value={usuarioActual.cargo || ''} onChange={e => setUsuarioActual({...usuarioActual, cargo: e.target.value})} placeholder="Ej: Jefe de Operaciones" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Contraseña {usuarioActual.id && '(Opcional)'}</label>
                                <input type="password" className="form-control" value={usuarioActual.password} onChange={e => setUsuarioActual({...usuarioActual, password: e.target.value})} required={!usuarioActual.id} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Rol Principal</label>
                                <select className="form-select" value={usuarioActual.rol} onChange={e => setUsuarioActual({...usuarioActual, rol: e.target.value})} required>
                                    <option value="operador">Operador (Basado en permisos)</option>
                                    <option value="admin">Administrador (Acceso Total)</option>
                                </select>
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3 text-primary-institucional border-bottom pb-2">Matriz de Permisos por Módulo</h6>
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered align-middle text-center">
                                <thead>
                                    <tr>
                                        <th className="text-start">Módulo / Sección</th>
                                        <th>Crear</th>
                                        <th>Editar</th>
                                        <th>Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modulos.map(mod => (
                                        <tr key={mod.id}>
                                            <td className="text-start fw-bold">{mod.label}</td>
                                            {['crear', 'editar', 'eliminar'].map(accion => (
                                                <td key={accion}>
                                                    {mod.acciones.includes(accion) ? (
                                                        <div className="form-check form-switch d-inline-block">
                                                            <input 
                                                                className="form-check-input custom-switch" 
                                                                type="checkbox" 
                                                                checked={usuarioActual.permisos[mod.id]?.[accion] || false}
                                                                onChange={() => handlePermisoChange(mod.id, accion)}
                                                                disabled={usuarioActual.rol === 'admin'}
                                                                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                            />
                                                        </div>
                                                    ) : <span className="text-muted small">N/A</span>}
                                                </td>
                                            ))}


                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {usuarioActual.rol === 'admin' && (
                                <div className="alert alert-info py-2">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Los usuarios con rol <strong>ADMIN</strong> tienen acceso total a todos los módulos ignorando la matriz de permisos.
                                </div>
                            )}
                        </div>

                        <div className="text-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={() => setVista('lista')}>Cancelar</button>
                            <button type="submit" className="btn btn-primary-institucional px-4">
                                <i className="bi bi-save me-2"></i> {usuarioActual.id ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    if (loading && vista === 'lista') return <div className="text-center p-5"><div className="spinner-border text-primary-institucional"></div></div>;

    return (
        <div className="usuarios-container">
            <style>
                {`
                    .custom-switch:not(:checked) {
                        background-color: #ced4da !important;
                        border-color: #adb5bd !important;
                    }
                `}
            </style>
            {vista === 'lista' ? renderLista() : renderFormulario()}
        </div>
    );

};

export default Usuarios;
