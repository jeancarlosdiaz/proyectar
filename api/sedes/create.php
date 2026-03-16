<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('sedes', 'crear');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre) && !empty($data->ciudad)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "INSERT INTO sedes SET nombre=:nombre, ciudad=:ciudad";
        $stmt = $conn->prepare($query);

        $data->nombre = htmlspecialchars(strip_tags($data->nombre));
        $data->ciudad = htmlspecialchars(strip_tags($data->ciudad));

        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":ciudad", $data->ciudad);

        if ($stmt->execute()) {
            $last_id = $conn->lastInsertId();
            Logger::logAction($conn, $_SESSION['user_id'], 'sedes', 'CREATE', $last_id, null, $data);
            
            http_response_code(201);
            echo json_encode(array("message" => "Sede creada exitosamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Error al crear la sede."));
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
