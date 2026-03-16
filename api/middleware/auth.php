<?php
// Middleware para verificar si el usuario está autenticado
function checkAuth() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(array("message" => "Acceso denegado. Se requiere iniciar sesión."));
        exit();
    }
}

// Opcional: Función para verificar si es administrador
function checkAdmin() {
    checkAuth();
    if ($_SESSION['user_rol'] !== 'admin') {
        http_response_code(403);
        echo json_encode(array("message" => "Acceso denegado. Se requiere rol de administrador."));
        exit();
    }
}

function checkPermission($modulo, $accion) {
    checkAuth();
    if ($_SESSION['user_rol'] === 'admin') return true;
    
    $permisos = json_decode($_SESSION['user_permisos'], true);
    if (!isset($permisos[$modulo][$accion]) || $permisos[$modulo][$accion] !== true) {
        http_response_code(403);
        echo json_encode(array("message" => "No tienes permiso para realizar esta acción ($modulo -> $accion)."));
        exit();
    }
}

?>
