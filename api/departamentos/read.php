<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

try {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "SELECT d.id, d.nombre, d.sede_id, s.nombre as sede_nombre, s.ciudad as sede_ciudad, d.creado_en,
              (SELECT COUNT(*) FROM equipos_medicos WHERE departamento_id = d.id) as total_equipos
              FROM departamentos d
              JOIN sedes s ON d.sede_id = s.id
              ORDER BY s.nombre ASC, d.nombre ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $deptos_arr = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($deptos_arr, $row);
    }

    http_response_code(200);
    echo json_encode($deptos_arr);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtener departamentos.", "error" => $e->getMessage()));
}
?>
