# 🚑 Sistema de Gestión Proyectar

Sistema integral para la gestión de ambulancias, equipos médicos, personal y seguimiento de calibraciones. Diseñado para optimizar el control operativo y el cumplimiento normativo en entornos de servicios de salud.

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
- Programación periódica de calibraciones.
- Cálculo automático de próximas fechas de mantenimiento.
- Historial de observaciones y soporte documental adjunto.

### 👥 Gestión de Personal
- Registro de conductores, paramédicos, enfermeros y médicos.
- Asignación de personal a unidades móviles específicas.
- Control de estado de vinculación.

### 🔐 Seguridad y Auditoría
- **Autenticación robusta:** Login seguro con roles (Admin/Operador) y hashes de contraseña.
- **Sistema de Auditoría:** Registro automático de todas las acciones (Crear, Actualizar, Eliminar) con detalles de valores anteriores y nuevos.
- **Middleware CORS:** Seguridad en las comunicaciones entre el frontend y la API.

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 19** (Vite)
- **Bootstrap 5** & Icons
- **React Router Dom**
- **Axios** para comunicación con API

### **Backend**
- **PHP (Nativo)** (Arquitectura modular)
- **PDO** para acceso seguro a datos (Protección contra Inyección SQL)
- **MySQL** (Motor de base de datos)

---

## 📂 Estructura del Proyecto

```text
proyectar/
├── api/                # Backend PHP (API RESTful)
│   ├── auth/           # Gestión de sesiones y login
│   ├── calibraciones/  # Módulo de equipos y mantenimientos
│   ├── equipos/        # Gestión de equipos médicos
│   ├── personal/       # Gestión de talento humano
│   ├── config/         # Configuración de BD y CORS
│   └── utils/          # Funciones auxiliares
├── client/             # Frontend React (Vite)
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Vistas principales del sistema
│   │   └── services/   # Llamadas a la API
│   └── public/         # Recursos estáticos
├── uploads/            # Almacenamiento de archivos PDF e Imágenes
└── database.sql        # Esquema de la base de datos
```

---

## ⚙️ Instalación y Configuración

### 1. Requisitos Previos
- Servidor local (XAMPP, WAMP o similar) con PHP 8.x+ y MySQL.
- Node.js y npm instalados.

### 2. Configuración de la Base de Datos
1. Abre **phpMyAdmin** o tu gestor de DB preferido.
2. Crea una base de datos llamada `sistema_ambulancias`.
3. Importa el archivo `database.sql` ubicado en la raíz del proyecto.
4. (Opcional) Ajusta las credenciales en `api/config/db.php`.

### 3. Configuración del Backend
El backend está listo para funcionar bajo `localhost`. Si usas un puerto diferente en Apache, asegúrate de actualizar el dominio en `api/config/db.php` para evitar errores de CORS:
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
