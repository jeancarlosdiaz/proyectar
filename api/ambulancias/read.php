<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$query = "SELECT a.id, a.placa, a.movil, a.sede_id, s.nombre as sede_nombre, a.soat_vencimiento, a.tecnomecanica_vencimiento, a.estado, a.soat_pdf, a.tecnomecanica_pdf, a.creado_en,
          (SELECT COUNT(*) FROM personal WHERE ambulancia_id = a.id) as total_personal,
          (SELECT COUNT(*) FROM equipos_medicos WHERE ambulancia_id = a.id) as total_equipos
          FROM ambulancias a 
          LEFT JOIN sedes s ON a.sede_id = s.id 
          ORDER BY a.creado_en DESC";
$stmt = $conn->prepare($query);
$stmt->execute();
$num = $stmt->rowCount();

if ($num > 0) {
    $ambulancias_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $ambulancia_item = array(
            "id" => $id,
            "placa" => $placa,
            "movil" => $movil,
            "sede_id" => $sede_id,
            "sede_nombre" => $sede_nombre,
            "soat_vencimiento" => $soat_vencimiento,
            "tecnomecanica_vencimiento" => $tecnomecanica_vencimiento,
            "estado" => $estado,
            "soat_pdf" => $soat_pdf,
            "tecnomecanica_pdf" => $tecnomecanica_pdf,
            "total_personal" => $total_personal,
            "total_equipos" => $total_equipos,
            "creado_en" => $creado_en
        );
        array_push($ambulancias_arr, $ambulancia_item);
    }
    
    http_response_code(200);
    echo json_encode($ambulancias_arr);
} else {
    http_response_code(200);
    echo json_encode(array()); // Devuelve un array vacío si no hay registros en lugar de un error 404
}
?>
