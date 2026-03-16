CREATE DATABASE IF NOT EXISTS sistema_ambulancias;
USE sistema_ambulancias;

-- 1. Tabla de Usuarios para Login Seguro
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar usuario administrador por defecto (Contraseña: admin123)
-- El password_hash se generó usando password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@sistema.com', '$2y$10$z5I0G9/5E35vKkG8R.mNl./kS7Q0w3C86vR8/o5o.o0sA5JOMs3u6', 'admin')
ON DUPLICATE KEY UPDATE nombre='Administrador';

-- 2. Tabla de Sedes
CREATE TABLE IF NOT EXISTS sedes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sedes (nombre, ciudad) VALUES 
('Sede Principal Valledupar', 'Valledupar'),
('Sede Santa Marta', 'Santa Marta')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- 3. Tabla de Departamentos Corporativos
CREATE TABLE IF NOT EXISTS departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    sede_id INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE CASCADE
);

-- 4. Tabla de Ambulancias
CREATE TABLE IF NOT EXISTS ambulancias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    movil INT DEFAULT NULL,
    sede_id INT DEFAULT NULL,
    soat_vencimiento DATE NOT NULL,
    tecnomecanica_vencimiento DATE NOT NULL,
    estado ENUM('Activa', 'Inactiva', 'Calibración') DEFAULT 'Activa',
    soat_pdf VARCHAR(255) DEFAULT NULL,
    tecnomecanica_pdf VARCHAR(255) DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sede_id) REFERENCES sedes(id) ON DELETE SET NULL
);

-- 3. Tabla de Personal
CREATE TABLE IF NOT EXISTS personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_identificacion VARCHAR(20) DEFAULT 'CC',
    identificacion VARCHAR(20) UNIQUE,
    cargo ENUM('Conductor', 'Paramédico', 'Enfermero', 'Médico') NOT NULL,
    ambulancia_id INT DEFAULT NULL,
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulancia_id) REFERENCES ambulancias(id) ON DELETE SET NULL
);

-- 4. Tabla de Tipos de Equipos
CREATE TABLE IF NOT EXISTS tipos_equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Equipos Médicos (Core del Sistema)
CREATE TABLE IF NOT EXISTS equipos_medicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_id INT DEFAULT NULL,
    marca VARCHAR(50) NOT NULL,
    serie VARCHAR(50) NOT NULL UNIQUE,
    manual_pdf VARCHAR(255) DEFAULT NULL,
    invima_pdf VARCHAR(255) DEFAULT NULL,
    protocolos_pdf VARCHAR(255) DEFAULT NULL,
    hoja_vida_pdf VARCHAR(255) DEFAULT NULL,
    guia_uso_tipo ENUM('ninguna', 'link', 'documento') DEFAULT 'ninguna',
    guia_uso_url VARCHAR(255) DEFAULT NULL,
    guia_uso_pdf VARCHAR(255) DEFAULT NULL,
    ambulancia_id INT DEFAULT NULL,
    departamento_id INT DEFAULT NULL,
    imagen_url VARCHAR(255) DEFAULT NULL,
    periodicidad_meses INT DEFAULT 6,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_id) REFERENCES tipos_equipos(id) ON DELETE SET NULL,
    FOREIGN KEY (ambulancia_id) REFERENCES ambulancias(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
);

-- 5. Tabla de Calibraciones
CREATE TABLE IF NOT EXISTS calibraciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    fecha_calibracion DATE NOT NULL,
    periodicidad_meses INT NOT NULL,
    proxima_fecha DATE NOT NULL,
    observaciones TEXT,
    documento_pdf VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (equipo_id) REFERENCES equipos_medicos(id) ON DELETE CASCADE
);

-- 6. Tabla para almacenar el historial de cambios (Auditoría)
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tabla_afectada VARCHAR(50) NOT NULL,
    accion ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN') NOT NULL,
    registro_id INT DEFAULT NULL,
    valor_anterior JSON DEFAULT NULL,
    valor_nuevo JSON DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 7. Tabla de Historial de Mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    fecha_mantenimiento DATE NOT NULL,
    tipo ENUM('preventivo', 'correctivo') NOT NULL,
    observaciones TEXT,
    soporte_pdf VARCHAR(255) DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos_medicos(id) ON DELETE CASCADE
);

