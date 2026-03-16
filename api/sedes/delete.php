<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('sedes', 'eliminar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $q_old = "SELECT * FROM sedes WHERE id=:id";
        $s_old = $conn->prepare($q_old);
        $s_old->bindParam(":id", $data->id);
        $s_old->execute();
        $old_data = $s_old->fetch(PDO::FETCH_ASSOC);

        $query = "DELETE FROM sedes WHERE id=:id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);

        if ($stmt->execute()) {
            if ($old_data) Logger::logAction($conn, $_SESSION['user_id'], 'sedes', 'DELETE', $data->id, $old_data, null);
            http_response_code(200);
            echo json_encode(array("message" => "Sede eliminada exitosamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Error al eliminar la sede."));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error del servidor.", "error" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "ID de sede no proporcionado."));
}
?>
