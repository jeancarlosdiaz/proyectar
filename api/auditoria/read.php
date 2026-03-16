<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

// Proteger endpoint, preferiblemente solo admim
checkAdmin();

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Join con usuarios para obtener datos legibles, ordenados por los más recientes
    $query = "SELECT a.id, a.tabla_afectada, a.accion, a.registro_id, a.valor_anterior, a.valor_nuevo, a.creado_en, u.nombre as usuario_nombre, u.email as usuario_email 
              FROM auditoria a
              JOIN usuarios u ON a.usuario_id = u.id
              ORDER BY a.creado_en DESC LIMIT 1000";

    $stmt = $conn->prepare($query);
    $stmt->execute();

    $auditoria_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Parsear JSONs de forma segura
        $row['valor_anterior'] = $row['valor_anterior'] ? json_decode($row['valor_anterior']) : null;
        $row['valor_nuevo'] = $row['valor_nuevo'] ? json_decode($row['valor_nuevo']) : null;
        array_push($auditoria_arr, $row);
    }

    http_response_code(200);
    echo json_encode($auditoria_arr);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Error al obtener la auditoria.", "error" => $e->getMessage()));
}
?>
