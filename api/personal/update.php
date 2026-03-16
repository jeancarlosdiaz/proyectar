<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('personal', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre) && !empty($data->cargo)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "UPDATE personal SET nombre=:nombre, tipo_identificacion=:tipo_identificacion, identificacion=:identificacion, cargo=:cargo, ambulancia_id=:ambulancia_id, estado=:estado WHERE id=:id";
    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->id = htmlspecialchars(strip_tags($data->id));

    // Obtener datos antiguos para auditoria
    $query_old = "SELECT * FROM personal WHERE id=:id";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->bindParam(":id", $data->id);
    $stmt_old->execute();
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);
    $data->nombre = htmlspecialchars(strip_tags($data->nombre));
    $data->tipo_identificacion = !empty($data->tipo_identificacion) ? htmlspecialchars(strip_tags($data->tipo_identificacion)) : 'CC';
    $data->identificacion = !empty($data->identificacion) ? htmlspecialchars(strip_tags($data->identificacion)) : null;
    $data->cargo = htmlspecialchars(strip_tags($data->cargo));
    $ambulancia_id = !empty($data->ambulancia_id) ? (int)$data->ambulancia_id : null;
    $estado = !empty($data->estado) ? $data->estado : 'Activo';

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":tipo_identificacion", $data->tipo_identificacion);
    $stmt->bindParam(":identificacion", $data->identificacion);
    $stmt->bindParam(":cargo", $data->cargo);
    $stmt->bindValue(":ambulancia_id", $ambulancia_id, PDO::PARAM_INT);
    $stmt->bindParam(":estado", $estado);

    if ($stmt->execute()) {
        Logger::logAction($conn, $_SESSION['user_id'], 'personal', 'UPDATE', $data->id, $old_data, $data);

        http_response_code(200);
        echo json_encode(array("message" => "Información de personal actualizada exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al actualizar la información del personal."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
