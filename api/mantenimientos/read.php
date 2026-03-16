<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$equipo_id = isset($_GET['equipo_id']) ? $_GET['equipo_id'] : null;

if ($equipo_id) {
    $query = "SELECT id, equipo_id, fecha_mantenimiento, tipo, observaciones, soporte_pdf, creado_en
              FROM mantenimientos
              WHERE equipo_id = :equipo_id
              ORDER BY fecha_mantenimiento DESC, id DESC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':equipo_id', $equipo_id);
} else {
    $query = "SELECT id, equipo_id, fecha_mantenimiento, tipo, observaciones, soporte_pdf, creado_en
              FROM mantenimientos
              ORDER BY fecha_mantenimiento DESC, id DESC";
    $stmt = $conn->prepare($query);
}

$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($results);
?>
