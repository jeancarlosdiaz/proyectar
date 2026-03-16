<?php
require_once 'api/config/db.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Contar registros
    $countEquipos = $conn->query("SELECT COUNT(*) FROM equipos_medicos")->fetchColumn();
    $countTipos = $conn->query("SELECT COUNT(*) FROM tipos_equipos")->fetchColumn();
    
    echo "Registros en equipos_medicos: $countEquipos\n";
    echo "Registros en tipos_equipos: $countTipos\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
