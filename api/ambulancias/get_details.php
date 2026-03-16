<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$id = isset($_GET['id']) ? $_GET['id'] : die(json_encode(["message" => "ID no proporcionado."]));

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Información básica de la ambulancia y sede
    $query = "SELECT a.*, s.nombre as sede_nombre, s.ciudad as sede_ciudad 
              FROM ambulancias a 
              LEFT JOIN sedes s ON a.sede_id = s.id 
              WHERE a.id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->execute();
    $ambulancia = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ambulancia) {
        http_response_code(404);
        echo json_encode(["message" => "Ambulancia no encontrada."]);
        exit;
    }

    // 2. Obtener Personal asignado
    $query_per = "SELECT id, nombre, cargo, tipo_identificacion, identificacion FROM personal WHERE ambulancia_id = :id AND estado = 'Activo'";
    $stmt_per = $conn->prepare($query_per);
    $stmt_per->bindParam(":id", $id);
    $stmt_per->execute();
    $personal = $stmt_per->fetchAll(PDO::FETCH_ASSOC);

    // 3. Obtener Equipos Médicos asignados
    $query_eq = "SELECT e.id, e.nombre, e.marca, e.modelo, e.serie, t.nombre as tipo_nombre 
                 FROM equipos_medicos e 
                 LEFT JOIN tipos_equipos t ON e.tipo_id = t.id
                 WHERE e.ambulancia_id = :id";
    $stmt_eq = $conn->prepare($query_eq);
    $stmt_eq->bindParam(":id", $id);
    $stmt_eq->execute();
    $equipos = $stmt_eq->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        "info" => $ambulancia,
        "personal" => $personal,
        "equipos" => $equipos
    ];

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error de servidor: " . $e->getMessage()]);
}
?>
