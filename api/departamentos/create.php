<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('departamentos', 'crear');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre) && !empty($data->sede_id)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "INSERT INTO departamentos SET nombre=:nombre, sede_id=:sede_id";
        $stmt = $conn->prepare($query);

        $data->nombre = htmlspecialchars(strip_tags($data->nombre));
        $sede_id = (int)$data->sede_id;

        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":sede_id", $sede_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $last_id = $conn->lastInsertId();
            Logger::logAction($conn, $_SESSION['user_id'], 'departamentos', 'CREATE', $last_id, null, $data);
            
            http_response_code(201);
            echo json_encode(array("message" => "Departamento creado exitosamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Error al crear el departamento."));
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
