<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    // Evitar que el administrador se elimine a sí mismo
    if ($data->id == $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(array("message" => "No puedes eliminar tu propia cuenta."));
        exit();
    }

    $db = new Database();
    $conn = $db->getConnection();

    // Obtener datos para auditoría
    $query_old = "SELECT * FROM usuarios WHERE id = ?";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->execute([$data->id]);
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

    $query = "DELETE FROM usuarios WHERE id = ?";
    $stmt = $conn->prepare($query);
    
    if ($stmt->execute([$data->id])) {
        Logger::logAction($conn, $_SESSION['user_id'], 'usuarios', 'DELETE', $data->id, $old_data, null);
        http_response_code(200);
        echo json_encode(array("message" => "Usuario eliminado exitosamente."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Error al eliminar usuario."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "ID no proporcionado."));
}
?>
