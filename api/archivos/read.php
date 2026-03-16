<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$query = "SELECT a.id, a.nombre_original, a.nombre_servidor, a.tipo, a.tamano, a.creado_en, u.nombre as subido_por
          FROM archivos a
          JOIN usuarios u ON a.usuario_id = u.id
          ORDER BY a.creado_en DESC";

try {
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $archivos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($archivos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error al obtener archivos.", "error" => $e->getMessage()]);
}
?>
