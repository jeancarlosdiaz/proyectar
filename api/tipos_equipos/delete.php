<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('tipos_equipos', 'eliminar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Verificar si hay equipos usando este tipo
        $query_check = "SELECT id FROM equipos_medicos WHERE tipo_id = :id LIMIT 1";
        $stmt_check = $conn->prepare($query_check);
        $stmt_check->bindParam(":id", $data->id);
        $stmt_check->execute();
        
        if ($stmt_check->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "No se puede eliminar el tipo porque tiene equipos asociados."));
            exit;
        }

        // Obtener valor para auditoría
        $query_old = "SELECT * FROM tipos_equipos WHERE id = :id";
        $stmt_old = $conn->prepare($query_old);
        $stmt_old->bindParam(":id", $data->id);
        $stmt_old->execute();
        $old_val = $stmt_old->fetch(PDO::FETCH_ASSOC);

        $query = "DELETE FROM tipos_equipos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
            Logger::logAction($conn, $_SESSION['user_id'], 'tipos_equipos', 'DELETE', $data->id, $old_val, null);
            
            http_response_code(200);
            echo json_encode(array("message" => "Tipo de equipo eliminado exitosamente."));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Error al eliminar tipo de equipo."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error de servidor.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "ID no proporcionado."));
}
?>
