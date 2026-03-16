<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->equipo_id) ||
    !isset($data->fecha_mantenimiento) ||
    !isset($data->tipo)
) {
    http_response_code(400);
    echo json_encode(["message" => "Datos incompletos. Se requiere equipo_id, fecha_mantenimiento y tipo."]);
    exit();
}

$equipo_id           = $data->equipo_id;
$fecha_mantenimiento = $data->fecha_mantenimiento;
$tipo                = $data->tipo;
$observaciones       = $data->observaciones ?? null;
$soporte_pdf         = $data->soporte_pdf ?? null;

$query = "INSERT INTO mantenimientos (equipo_id, fecha_mantenimiento, tipo, observaciones, soporte_pdf)
          VALUES (:equipo_id, :fecha_mantenimiento, :tipo, :observaciones, :soporte_pdf)";

$stmt = $conn->prepare($query);
$stmt->bindParam(':equipo_id',           $equipo_id);
$stmt->bindParam(':fecha_mantenimiento', $fecha_mantenimiento);
$stmt->bindParam(':tipo',                $tipo);
$stmt->bindParam(':observaciones',       $observaciones);
$stmt->bindParam(':soporte_pdf',         $soporte_pdf);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["message" => "Mantenimiento registrado correctamente.", "id" => $conn->lastInsertId()]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "No se pudo registrar el mantenimiento."]);
}
?>
