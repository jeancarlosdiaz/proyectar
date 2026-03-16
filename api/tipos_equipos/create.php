<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('tipos_equipos', 'crear');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        $query = "INSERT INTO tipos_equipos SET nombre = :nombre";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":nombre", $data->nombre);

        if ($stmt->execute()) {
            $last_id = $conn->lastInsertId();
            Logger::logAction($conn, $_SESSION['user_id'], 'tipos_equipos', 'CREATE', $last_id, null, ["nombre" => $data->nombre]);
            
            http_response_code(201);
            echo json_encode(array("message" => "Tipo de equipo creado exitosamente."));
        } else {
            http_response_code(500);
            echo json_encode(array("message" => "Error al crear tipo de equipo."));
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
