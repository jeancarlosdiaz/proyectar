<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAdmin();

$db = new Database();
$conn = $db->getConnection();

$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($id) {
    $query = "SELECT id, nombre, email, cargo, rol, permisos, creado_en FROM usuarios WHERE id = ? LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $row['permisos'] = json_decode($row['permisos']);
        http_response_code(200);
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Usuario no encontrado."));
    }
} else {
    $query = "SELECT id, nombre, email, cargo, rol, creado_en FROM usuarios ORDER BY creado_en DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $usuarios = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($usuarios, $row);
    }
    
    http_response_code(200);
    echo json_encode($usuarios);
}
?>
