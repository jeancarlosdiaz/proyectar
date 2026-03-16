<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$id = isset($_GET['id']) ? $_GET['id'] : null;

if ($id) {
    // Leer un solo equipo
    $query = "SELECT e.*, a.placa as ambulancia_placa, a.movil as ambulancia_movil, d.nombre as depto_nombre, s.nombre as depto_sede_nombre, te.nombre as tipo_nombre
              FROM equipos_medicos e 
              LEFT JOIN ambulancias a ON e.ambulancia_id = a.id 
              LEFT JOIN departamentos d ON e.departamento_id = d.id
              LEFT JOIN sedes s ON d.sede_id = s.id
              LEFT JOIN tipos_equipos te ON e.tipo_id = te.id
              WHERE e.id = ? LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($row);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Equipo no encontrado."));
    }
} else {
    // Leer todos
    $query = "SELECT e.*, a.placa as ambulancia_placa, a.movil as ambulancia_movil, d.nombre as depto_nombre, s.nombre as depto_sede_nombre, te.nombre as tipo_nombre
              FROM equipos_medicos e 
              LEFT JOIN ambulancias a ON e.ambulancia_id = a.id 
              LEFT JOIN departamentos d ON e.departamento_id = d.id
              LEFT JOIN sedes s ON d.sede_id = s.id
              LEFT JOIN tipos_equipos te ON e.tipo_id = te.id
              ORDER BY e.creado_en DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $equipos_arr = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($equipos_arr, $row);
        }
        
        http_response_code(200);
        echo json_encode($equipos_arr);
    } else {
        http_response_code(200);
        echo json_encode(array());
    }
}
?>
