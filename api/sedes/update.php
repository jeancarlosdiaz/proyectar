<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('sedes', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre) && !empty($data->ciudad)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Datos antiguos
        $q_old = "SELECT * FROM sedes WHERE id=:id";
        $s_old = $conn->prepare($q_old);
        $s_old->bindParam(":id", $data->id);
        $s_old->execute();
        $old_data = $s_old->fetch(PDO::FETCH_ASSOC);

        $query = "UPDATE sedes SET nombre=:nombre, ciudad=:ciudad WHERE id=:id";
        $stmt = $conn->prepare($query);

        $data->id = htmlspecialchars(strip_tags($data->id));
        $data->nombre = htmlspecialchars(strip_tags($data->nombre));
        $data->ciudad = htmlspecialchars(strip_tags($data->ciudad));

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":ciudad", $data->ciudad);

        if ($stmt->execute()) {
            Logger::logAction($conn, $_SESSION['user_id'], 'sedes', 'UPDATE', $data->id, $old_data, $data);
            http_response_code(200);
            echo json_encode(array("message" => "Sede actualizada exitosamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Error al actualizar la sede."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error del servidor.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
