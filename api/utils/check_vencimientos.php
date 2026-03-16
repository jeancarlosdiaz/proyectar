<?php
require_once '../config/db.php';
// Esta función simula una tarea CRON o comprobación asíncrona que el frontend Admin podría invocar tras loguearse

$db = new Database();
$conn = $db->getConnection();

$alertas = array();

// Verificar SOAT y Tecnomecánica vencida o próxima a vencer hoy
$query_amb = "SELECT placa, soat_vencimiento, tecnomecanica_vencimiento FROM ambulancias WHERE DATEDIFF(soat_vencimiento, CURDATE()) <= 15 OR DATEDIFF(tecnomecanica_vencimiento, CURDATE()) <= 15";
$stmt_amb = $conn->query($query_amb);

while($row = $stmt_amb->fetch(PDO::FETCH_ASSOC)) {
    $soat_diferencia = round((strtotime($row['soat_vencimiento']) - time()) / (60 * 60 * 24));
    if ($soat_diferencia < 0) {
        $alertas[] = "SOAT VENCIDO: Ambulancia placa {$row['placa']}";
    } else if ($soat_diferencia <= 15) {
        $alertas[] = "SOAT PRÓXIMO A VENCER ({$soat_diferencia} días): Ambulancia placa {$row['placa']}";
    }
    
    $tecno_diferencia = round((strtotime($row['tecnomecanica_vencimiento']) - time()) / (60 * 60 * 24));
    if ($tecno_diferencia < 0) {
        $alertas[] = "TECNOMECÁNICA VENCIDA: Ambulancia placa {$row['placa']}";
    } else if ($tecno_diferencia <= 15) {
        $alertas[] = "TECNOMECÁNICA PRÓXIMA A VENCER ({$tecno_diferencia} días): Ambulancia placa {$row['placa']}";
    }
}

// Verificar Calibraciones
$query_calib = "SELECT e.nombre, e.serie, m.proxima_fecha FROM calibraciones m JOIN equipos_medicos e ON m.equipo_id = e.id WHERE m.id IN (SELECT MAX(id) FROM calibraciones GROUP BY equipo_id) AND DATEDIFF(m.proxima_fecha, CURDATE()) <= 15";
$stmt_calib = $conn->query($query_calib);

while($row = $stmt_calib->fetch(PDO::FETCH_ASSOC)) {
    $mant_diferencia = round((strtotime($row['proxima_fecha']) - time()) / (60 * 60 * 24));
    if ($mant_diferencia < 0) {
        $alertas[] = "CALIBRACIÓN VENCIDA: Equipo {$row['nombre']} (Serie: {$row['serie']})";
    } else {
        $alertas[] = "CALIBRACIÓN PRÓXIMA ({$mant_diferencia} días): Equipo {$row['nombre']} (Serie: {$row['serie']})";
    }
}

http_response_code(200);
echo json_encode(array(
    "notificaciones" => $alertas,
    "count" => count($alertas)
));
?>
