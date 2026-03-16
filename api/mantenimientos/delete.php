<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

// Solo administradores pueden eliminar mantenimientos
checkAdmin();

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(["message" => "ID de mantenimiento no proporcionado."]);
    exit();
}

$id = $data->id;

$query = "DELETE FROM mantenimientos WHERE id = :id";
$stmt  = $conn->prepare($query);
$stmt->bindParam(':id', $id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "Mantenimiento eliminado correctamente."]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "No se pudo eliminar el mantenimiento."]);
}
?>
