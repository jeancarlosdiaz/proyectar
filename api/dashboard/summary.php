<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$db = new Database();
$conn = $db->getConnection();

$summary = array(
    "total_ambulancias" => 0,
    "total_equipos" => 0,
    "total_personal" => 0,
    "calibraciones_vencidas" => array(),
    "calibraciones_alertas" => array(),
    "documentos_vencidos" => array("soat" => 0, "tecno" => 0)
);

// Totales rápidos
$q1 = $conn->query("SELECT COUNT(*) as total FROM ambulancias");
$summary["total_ambulancias"] = $q1->fetch(PDO::FETCH_ASSOC)['total'];

$q2 = $conn->query("SELECT COUNT(*) as total FROM equipos_medicos");
$summary["total_equipos"] = $q2->fetch(PDO::FETCH_ASSOC)['total'];

$q3 = $conn->query("SELECT COUNT(*) as total FROM personal");
$summary["total_personal"] = $q3->fetch(PDO::FETCH_ASSOC)['total'];

// Conteo de documentos vencidos para las tarjetas
$q_docs = $conn->query("SELECT 
    SUM(CASE WHEN soat_vencimiento < CURDATE() THEN 1 ELSE 0 END) as soat_vencidos,
    SUM(CASE WHEN tecnomecanica_vencimiento < CURDATE() THEN 1 ELSE 0 END) as tecno_vencidos
    FROM ambulancias");
$res_docs = $q_docs->fetch(PDO::FETCH_ASSOC);
$summary["documentos_vencidos"]["soat"] = $res_docs['soat_vencidos'] ?? 0;
$summary["documentos_vencidos"]["tecno"] = $res_docs['tecno_vencidos'] ?? 0;

// Alertas Calibraciones Vencidas (Ya pasaron la fecha)
$query_vencidas = "SELECT m.id, e.id as equipo_id, e.nombre, e.serie, m.proxima_fecha, 
                  CASE WHEN e.ambulancia_id IS NOT NULL THEN 'Ambulancia' ELSE 'Departamento' END as ubicacion
                  FROM calibraciones m 
                  JOIN equipos_medicos e ON m.equipo_id = e.id 
                  WHERE m.id IN (SELECT MAX(id) FROM calibraciones GROUP BY equipo_id)
                  AND m.proxima_fecha < CURDATE()
                  ORDER BY m.proxima_fecha ASC";
$stmt_vencidas = $conn->prepare($query_vencidas);
$stmt_vencidas->execute();
$summary["calibraciones_vencidas"] = $stmt_vencidas->fetchAll(PDO::FETCH_ASSOC);

// Alertas Calibraciones Próximas (En los próximos 15 días)
$query_alertas = "SELECT m.id, e.id as equipo_id, e.nombre as equipo_nombre, e.serie, m.proxima_fecha,
                 CASE WHEN e.ambulancia_id IS NOT NULL THEN 'Ambulancia' ELSE 'Departamento' END as ubicacion
                 FROM calibraciones m 
                 JOIN equipos_medicos e ON m.equipo_id = e.id 
                 WHERE m.id IN (SELECT MAX(id) FROM calibraciones GROUP BY equipo_id)
                 AND DATEDIFF(m.proxima_fecha, CURDATE()) BETWEEN 0 AND 15
                 ORDER BY m.proxima_fecha ASC";
$stmt_alertas = $conn->prepare($query_alertas);
$stmt_alertas->execute();
$summary["calibraciones_alertas"] = $stmt_alertas->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($summary);
?>

