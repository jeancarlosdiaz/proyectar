<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

try {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "SELECT id, nombre, ciudad, creado_en FROM sedes ORDER BY nombre ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $sedes_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($sedes_arr, $row);
    }

    http_response_code(200);
    echo json_encode($sedes_arr);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtener sedes.", "error" => $e->getMessage()));
}
?>
