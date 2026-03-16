<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkAuth();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->equipo_id) && !empty($data->fecha_calibracion) && isset($data->periodicidad_meses)) {
    $db = new Database();
    $conn = $db->getConnection();

    // Calcular próxima fecha automáticamente en PHP
    $fecha_calib = $data->fecha_calibracion;
    $meses = (int)$data->periodicidad_meses;
    $proxima_fecha = date('Y-m-d', strtotime("+$meses months", strtotime($fecha_calib)));

    $query = "INSERT INTO calibraciones SET equipo_id=:equipo_id, fecha_calibracion=:fecha_calibracion, periodicidad_meses=:periodicidad_meses, proxima_fecha=:proxima_fecha, observaciones=:observaciones, documento_pdf=:documento_pdf";
    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->equipo_id = htmlspecialchars(strip_tags($data->equipo_id));
    $fecha_calib = htmlspecialchars(strip_tags($fecha_calib));
    $observaciones = !empty($data->observaciones) ? htmlspecialchars(strip_tags($data->observaciones)) : null;

    $stmt->bindParam(":equipo_id", $data->equipo_id);
    $stmt->bindParam(":fecha_calibracion", $fecha_calib);
    $stmt->bindParam(":periodicidad_meses", $meses);
    $stmt->bindParam(":proxima_fecha", $proxima_fecha);
    $stmt->bindParam(":observaciones", $observaciones);
    $stmt->bindParam(":documento_pdf", $data->documento_pdf);

    if ($stmt->execute()) {
        $last_id = $conn->lastInsertId();
        $data->proxima_fecha = $proxima_fecha;
        Logger::logAction($conn, $_SESSION['user_id'], 'calibraciones', 'CREATE', $last_id, null, $data);

        http_response_code(201);
        echo json_encode(array("message" => "Calibración registrada exitosamente.", "proxima_fecha" => $proxima_fecha));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al registrar la calibración."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos. Se requiere equipo_id, fecha_calibracion y periodicidad_meses."));
}
?>
