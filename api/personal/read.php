<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

// Opcionalmente podemos hacer un JOIN con ambulancias para traer la placa y el movil
$query = "SELECT p.id, p.nombre, p.tipo_identificacion, p.identificacion, p.cargo, p.ambulancia_id, p.estado, a.placa as ambulancia_placa, a.movil as ambulancia_movil
          FROM personal p 
          LEFT JOIN ambulancias a ON p.ambulancia_id = a.id 
          ORDER BY p.id DESC";
$stmt = $conn->prepare($query);
$stmt->execute();
$num = $stmt->rowCount();

if ($num > 0) {
    $personal_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $personal_item = array(
            "id" => $id,
            "nombre" => $nombre,
            "tipo_identificacion" => $tipo_identificacion,
            "identificacion" => $identificacion,
            "cargo" => $cargo,
            "ambulancia_id" => $ambulancia_id,
            "ambulancia_placa" => $ambulancia_placa,
            "ambulancia_movil" => $ambulancia_movil,
            "estado" => $estado
        );
        array_push($personal_arr, $personal_item);
    }
    
    http_response_code(200);
    echo json_encode($personal_arr);
} else {
    http_response_code(200);
    echo json_encode(array());
}
?>
