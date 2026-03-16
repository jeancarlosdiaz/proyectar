# 🚑 Sistema de Gestión Proyectar

Sistema integral para la gestión de ambulancias, equipos médicos, personal y seguimiento de calibraciones y mantenimientos. Diseñado para optimizar el control operativo y el cumplimiento normativo en entornos de servicios de salud.

---

## 🚀 Características Principales

### 🏥 Gestión de Ambulancias
- Seguimiento detallado por placa y número de móvil.
- Control de vencimientos de **SOAT** y **Tecnomecánica**.
- Almacenamiento centralizado de documentos legales en PDF.
- Registro de estado operativo (Activa, Inactiva, en Calibración).

### 🩺 Inventario de Equipos Médicos
- Control exhaustivo de equipos por marca, serie y tipo.
- Gestión de documentación técnica: INVIMA, manuales, protocolos y hojas de vida.
- Vinculación de guías de uso (enlaces o documentos).
- Asignación dinámica a ambulancias o departamentos corporativos.

### ⚖️ Control de Calibraciones
- Programación periódica de calibraciones por equipo.
- Cálculo automático de próximas fechas de calibración.
- Historial con certificados adjuntables (PDF) por calibración.
- Dashboard con alertas de calibraciones vencidas o por vencer.

### 🔧 Historial de Mantenimientos
- Registro de mantenimientos **preventivos** y **correctivos** por equipo.
- Campos: fecha, tipo, observaciones y soporte documental (PDF).
- Historial inmutable: **solo el administrador puede eliminar** registros.
- Integrado directamente en la Hoja de Vida de cada equipo.

### 👥 Gestión de Personal
- Registro de conductores, paramédicos, enfermeros y médicos.
- Asignación de personal a unidades móviles específicas.
- Control de estado de vinculación.

### 📁 Gestión de Archivos
- Repositorio centralizado de documentos del sistema.
- Selector de archivos integrado en formularios de equipos, calibraciones y mantenimientos.
- Soporte para previsualización antes de selección.

### 🔐 Seguridad y Auditoría
- **Autenticación robusta:** Login seguro con roles (Admin/Operador) y hashes de contraseña.
- **Sistema de Auditoría:** Registro automático de todas las acciones (Crear, Actualizar, Eliminar) con detalles de valores anteriores y nuevos.
- **Control de roles:** Eliminación de calibraciones y mantenimientos restringida a administradores.
- **Middleware CORS:** Seguridad en las comunicaciones entre el frontend y la API.

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 19** (Vite)
- **Bootstrap 5** & Icons
- **React Router Dom v7**
- **Axios** para comunicación con API

### **Backend**
- **PHP (Nativo)** — Arquitectura modular REST
- **PDO** para acceso seguro a datos (protección contra SQL Injection)
- **MySQL** (motor de base de datos)

---

## 📂 Estructura del Proyecto

```text
proyectar/
├── api/                    # Backend PHP (API RESTful)
│   ├── auth/               # Login y gestión de sesiones
│   ├── calibraciones/      # CRUD de calibraciones de equipos
│   ├── mantenimientos/     # CRUD de historial de mantenimientos
│   ├── equipos/            # Gestión de equipos médicos
│   ├── ambulancias/        # Gestión de ambulancias
│   ├── personal/           # Gestión de talento humano
│   ├── archivos/           # Gestión del repositorio de archivos
│   ├── dashboard/          # Resumen estadístico para el panel
│   ├── sedes/              # Gestión de sedes
│   ├── departamentos/      # Gestión de departamentos
│   ├── auditoria/          # Consulta del log de auditoría
│   ├── config/             # Configuración de BD y CORS
│   ├── middleware/          # Autenticación y control de roles
│   └── utils/              # Funciones auxiliares
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (FilePickerModal, etc.)
│   │   └── pages/          # Vistas principales del sistema
│   └── public/             # Recursos estáticos
├── uploads/                # Almacenamiento de archivos PDF e imágenes
└── database.sql            # Esquema completo de la base de datos
```

---

## 🗄️ Esquema de Base de Datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Cuentas y roles del sistema |
| `sedes` | Sedes de la organización |
| `departamentos` | Departamentos por sede |
| `ambulancias` | Unidades móviles |
| `personal` | Personal asignado a ambulancias |
| `tipos_equipos` | Categorías de equipos |
| `equipos_medicos` | Inventario de equipos médicos |
| `calibraciones` | Historial de calibraciones por equipo |
| `mantenimientos` | Historial de mantenimientos preventivos/correctivos |
| `auditoria` | Log de todas las acciones del sistema |

---

## ⚙️ Instalación y Configuración

### 1. Requisitos Previos
- Servidor local (XAMPP, WAMP o similar) con PHP 8.x+ y MySQL.
- Node.js y npm instalados.

### 2. Configuración de la Base de Datos
1. Abre **phpMyAdmin** o tu gestor de BD preferido.
2. Crea una base de datos llamada `sistema_ambulancias`.
3. Importa el archivo `database.sql` ubicado en la raíz del proyecto.
4. (Opcional) Ajusta las credenciales en `api/config/db.php`.

### 3. Configuración del Backend
El backend está listo para funcionar bajo `localhost`. Si usas un puerto diferente, actualiza el origen permitido en `api/config/db.php`:
```php
header("Access-Control-Allow-Origin: http://localhost:5173");
```

### 4. Inicialización del Frontend
```bash
cd client
npm install
npm run dev
```
Accede a `http://localhost:5173` para comenzar.

---

## 📧 Credenciales de Acceso (Por Defecto)
- **Usuario:** `admin@sistema.com`
- **Contraseña:** `admin123`

---

## 📄 Licencia
Este proyecto es una aplicación privada desarrollada para la gestión operativa. Todos los derechos reservados.
