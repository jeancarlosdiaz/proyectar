<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkAuth();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->equipo_id) && !empty($data->fecha_calibracion) && isset($data->periodicidad_meses)) {
    $db = new Database();
    $conn = $db->getConnection();

    $fecha_calib = $data->fecha_calibracion;
    $meses = (int)$data->periodicidad_meses;
    $proxima_fecha = date('Y-m-d', strtotime("+$meses months", strtotime($fecha_calib)));

    $query = "UPDATE calibraciones SET equipo_id=:equipo_id, fecha_calibracion=:fecha_calibracion, periodicidad_meses=:periodicidad_meses, proxima_fecha=:proxima_fecha, observaciones=:observaciones WHERE id=:id";
    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->id = htmlspecialchars(strip_tags($data->id));

    // Obtener datos antiguos
    $query_old = "SELECT * FROM calibraciones WHERE id=:id";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->bindParam(":id", $data->id);
    $stmt_old->execute();
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);
    $data->equipo_id = htmlspecialchars(strip_tags($data->equipo_id));
    $fecha_calib = htmlspecialchars(strip_tags($fecha_calib));
    $observaciones = !empty($data->observaciones) ? htmlspecialchars(strip_tags($data->observaciones)) : null;

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":equipo_id", $data->equipo_id);
    $stmt->bindParam(":fecha_calibracion", $fecha_calib);
    $stmt->bindParam(":periodicidad_meses", $meses);
    $stmt->bindParam(":proxima_fecha", $proxima_fecha);
    $stmt->bindParam(":observaciones", $observaciones);

    if ($stmt->execute()) {
        $data->proxima_fecha = $proxima_fecha;
        Logger::logAction($conn, $_SESSION['user_id'], 'calibraciones', 'UPDATE', $data->id, $old_data, $data);

        http_response_code(200);
        echo json_encode(array("message" => "Calibración actualizada exitosamente.", "proxima_fecha" => $proxima_fecha));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al actualizar la calibración."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
