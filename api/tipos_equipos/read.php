<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

try {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "SELECT id, nombre, creado_en FROM tipos_equipos ORDER BY nombre ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $tipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($tipos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtener tipos de equipos.", "error" => $e->getMessage()));
}
?>
