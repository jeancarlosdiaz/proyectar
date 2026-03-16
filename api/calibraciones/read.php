<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$equipo_id = isset($_GET['equipo_id']) ? $_GET['equipo_id'] : null;

if ($equipo_id) {
    // Leer calibraciones de un equipo específico
    $query = "SELECT m.id, m.equipo_id, e.nombre as equipo_nombre, m.fecha_calibracion, m.periodicidad_meses, m.proxima_fecha, m.observaciones, m.documento_pdf
              FROM calibraciones m 
              LEFT JOIN equipos_medicos e ON m.equipo_id = e.id 
              WHERE m.equipo_id = ? 
              ORDER BY m.fecha_calibracion DESC, m.id DESC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $equipo_id);
} else {
    // Leer todos
    $query = "SELECT m.id, m.equipo_id, e.nombre as equipo_nombre, m.fecha_calibracion, m.periodicidad_meses, m.proxima_fecha, m.observaciones, m.documento_pdf
              FROM calibraciones m 
              LEFT JOIN equipos_medicos e ON m.equipo_id = e.id 
              ORDER BY m.fecha_calibracion DESC, m.id DESC";
    $stmt = $conn->prepare($query);
}

$stmt->execute();
$num = $stmt->rowCount();

if ($num > 0) {
    $calibraciones_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($calibraciones_arr, $row);
    }
    
    http_response_code(200);
    echo json_encode($calibraciones_arr);
} else {
    http_response_code(200);
    echo json_encode(array());
}
?>
