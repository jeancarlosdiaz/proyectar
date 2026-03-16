<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('ambulancias', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->placa) && !empty($data->soat_vencimiento) && !empty($data->tecnomecanica_vencimiento) && !empty($data->estado)) {
    $db = new Database();
    $conn = $db->getConnection();

    // Sanitizar
    $data->id = htmlspecialchars(strip_tags($data->id));

    // Obtener datos antiguos para auditoria
    $query_old = "SELECT * FROM ambulancias WHERE id=:id";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->bindParam(":id", $data->id);
    $stmt_old->execute();
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

    $query = "UPDATE ambulancias SET placa=:placa, movil=:movil, sede_id=:sede_id, soat_vencimiento=:soat_vencimiento, tecnomecanica_vencimiento=:tecnomecanica_vencimiento, estado=:estado, soat_pdf=:soat_pdf, tecnomecanica_pdf=:tecnomecanica_pdf WHERE id=:id";
    $stmt = $conn->prepare($query);

    $data->placa = strtoupper(htmlspecialchars(strip_tags($data->placa)));
    $movil = !empty($data->movil) ? (int)$data->movil : null;
    $sede_id = !empty($data->sede_id) ? (int)$data->sede_id : null;
    $data->soat_vencimiento = htmlspecialchars(strip_tags($data->soat_vencimiento));
    $data->tecnomecanica_vencimiento = htmlspecialchars(strip_tags($data->tecnomecanica_vencimiento));
    $data->estado = htmlspecialchars(strip_tags($data->estado));

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":placa", $data->placa);
    if ($movil !== null) {
        $stmt->bindParam(":movil", $movil, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(":movil", null, PDO::PARAM_NULL);
    }
    if ($sede_id !== null) {
        $stmt->bindParam(":sede_id", $sede_id, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(":sede_id", null, PDO::PARAM_NULL);
    }
    $stmt->bindParam(":soat_vencimiento", $data->soat_vencimiento);
    $stmt->bindParam(":tecnomecanica_vencimiento", $data->tecnomecanica_vencimiento);
    $stmt->bindParam(":estado", $data->estado);
    $stmt->bindParam(":soat_pdf", $data->soat_pdf);
    $stmt->bindParam(":tecnomecanica_pdf", $data->tecnomecanica_pdf);

    if ($stmt->execute()) {
        Logger::logAction($conn, $_SESSION['user_id'], 'ambulancias', 'UPDATE', $data->id, $old_data, $data);

        http_response_code(200);
        echo json_encode(array("message" => "Ambulancia actualizada exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al actualizar la ambulancia."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
