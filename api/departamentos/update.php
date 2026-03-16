<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('departamentos', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre) && !empty($data->sede_id)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // Datos antiguos
        $q_old = "SELECT * FROM departamentos WHERE id=:id";
        $s_old = $conn->prepare($q_old);
        $s_old->bindParam(":id", $data->id);
        $s_old->execute();
        $old_data = $s_old->fetch(PDO::FETCH_ASSOC);

        $query = "UPDATE departamentos SET nombre=:nombre, sede_id=:sede_id WHERE id=:id";
        $stmt = $conn->prepare($query);

        $data->id = (int)$data->id;
        $data->nombre = htmlspecialchars(strip_tags($data->nombre));
        $sede_id = (int)$data->sede_id;

        $stmt->bindParam(":id", $data->id, PDO::PARAM_INT);
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":sede_id", $sede_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            Logger::logAction($conn, $_SESSION['user_id'], 'departamentos', 'UPDATE', $data->id, $old_data, $data);
            http_response_code(200);
            echo json_encode(array("message" => "Departamento actualizado exitosamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Error al actualizar el departamento."));
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
