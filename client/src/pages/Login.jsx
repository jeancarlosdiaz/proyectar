import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost/proyectar/api/auth/login.php', {
        email,
        password
      }, {
        withCredentials: true // Importante para enviar cookies de sesión a PHP
      });

      if (response.status === 200) {
        // Guardamos user stringified temporalmente para validar ProtectedRoutes en el frontend
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '400px', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <h2 className="text-primary-institucional fw-bold">PROYECTAR</h2>
          <p className="text-muted">Sistema de Gestión de Ambulancias</p>
        </div>
        
        {error && <div className="alert alert-danger text-center">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="admin@sistema.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary-institucional w-100 py-2 d-flex justify-content-center align-items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
