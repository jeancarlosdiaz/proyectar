<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('personal', 'eliminar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $db = new Database();
    $conn = $db->getConnection();

    $data->id = htmlspecialchars(strip_tags($data->id));

    // Obtener datos antiguos para auditoria
    $query_old = "SELECT * FROM personal WHERE id=:id";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->bindParam(":id", $data->id);
    $stmt_old->execute();
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM personal WHERE id=:id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":id", $data->id);

    if ($stmt->execute()) {
        if ($old_data) {
            Logger::logAction($conn, $_SESSION['user_id'], 'personal', 'DELETE', $data->id, $old_data, null);
        }
        http_response_code(200);
        echo json_encode(array("message" => "Personal eliminado exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al eliminar el personal."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Falta el ID del personal."));
}
?>
