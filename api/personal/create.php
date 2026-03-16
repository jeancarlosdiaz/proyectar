<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('personal', 'crear');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre) && !empty($data->cargo)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "INSERT INTO personal SET nombre=:nombre, tipo_identificacion=:tipo_identificacion, identificacion=:identificacion, cargo=:cargo, ambulancia_id=:ambulancia_id, estado=:estado";
    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->nombre = htmlspecialchars(strip_tags($data->nombre));
    $data->tipo_identificacion = !empty($data->tipo_identificacion) ? htmlspecialchars(strip_tags($data->tipo_identificacion)) : 'CC';
    $data->identificacion = !empty($data->identificacion) ? htmlspecialchars(strip_tags($data->identificacion)) : null;
    $data->cargo = htmlspecialchars(strip_tags($data->cargo));
    $ambulancia_id = !empty($data->ambulancia_id) ? (int)$data->ambulancia_id : null;
    $estado = !empty($data->estado) ? $data->estado : 'Activo';

    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":tipo_identificacion", $data->tipo_identificacion);
    $stmt->bindParam(":identificacion", $data->identificacion);
    $stmt->bindParam(":cargo", $data->cargo);
    $stmt->bindValue(":ambulancia_id", $ambulancia_id, PDO::PARAM_INT);
    $stmt->bindParam(":estado", $estado);

    if ($stmt->execute()) {
        $last_id = $conn->lastInsertId();
        Logger::logAction($conn, $_SESSION['user_id'], 'personal', 'CREATE', $last_id, null, $data);

        http_response_code(201);
        echo json_encode(array("message" => "Personal registrado exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al registrar el personal."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
