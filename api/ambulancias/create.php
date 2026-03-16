<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

// Proteger endpoint
checkPermission('ambulancias', 'crear');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->placa) && !empty($data->soat_vencimiento) && !empty($data->tecnomecanica_vencimiento) && !empty($data->estado)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "INSERT INTO ambulancias SET placa=:placa, movil=:movil, sede_id=:sede_id, soat_vencimiento=:soat_vencimiento, tecnomecanica_vencimiento=:tecnomecanica_vencimiento, estado=:estado, soat_pdf=:soat_pdf, tecnomecanica_pdf=:tecnomecanica_pdf";
    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->placa = strtoupper(htmlspecialchars(strip_tags($data->placa)));
    $movil = !empty($data->movil) ? (int)$data->movil : null;
    $sede_id = !empty($data->sede_id) ? (int)$data->sede_id : null;
    $data->soat_vencimiento = htmlspecialchars(strip_tags($data->soat_vencimiento));
    $data->tecnomecanica_vencimiento = htmlspecialchars(strip_tags($data->tecnomecanica_vencimiento));
    $data->estado = htmlspecialchars(strip_tags($data->estado));

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
        $last_id = $conn->lastInsertId();
        Logger::logAction($conn, $_SESSION['user_id'], 'ambulancias', 'CREATE', $last_id, null, $data);

        http_response_code(201);
        echo json_encode(array("message" => "Ambulancia creada exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al crear la ambulancia."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
