<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('tipos_equipos', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Obtener valor anterior para auditoría
        $query_old = "SELECT * FROM tipos_equipos WHERE id = :id";
        $stmt_old = $conn->prepare($query_old);
        $stmt_old->bindParam(":id", $data->id);
        $stmt_old->execute();
        $old_val = $stmt_old->fetch(PDO::FETCH_ASSOC);

        $query = "UPDATE tipos_equipos SET nombre = :nombre WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
            Logger::logAction($conn, $_SESSION['user_id'], 'tipos_equipos', 'UPDATE', $data->id, $old_val, ["nombre" => $data->nombre]);
            
            http_response_code(200);
            echo json_encode(array("message" => "Tipo de equipo actualizado exitosamente."));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Error al actualizar tipo de equipo."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error de servidor.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
