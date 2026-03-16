<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('equipos', 'editar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre) && !empty($data->marca) && !empty($data->serie)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "UPDATE equipos_medicos SET nombre=:nombre, tipo_id=:tipo_id, marca=:marca, modelo=:modelo, serie=:serie, manual_pdf=:manual_pdf, invima_pdf=:invima_pdf, protocolos_pdf=:protocolos_pdf, hoja_vida_pdf=:hoja_vida_pdf, guia_uso_tipo=:guia_uso_tipo, guia_uso_url=:guia_uso_url, guia_uso_pdf=:guia_uso_pdf, ambulancia_id=:ambulancia_id, departamento_id=:departamento_id, imagen_url=:imagen_url, periodicidad_meses=:periodicidad_meses WHERE id=:id";

    $stmt = $conn->prepare($query);

    // Sanitizar
    $data->id = htmlspecialchars(strip_tags($data->id));

    // Obtener datos antiguos
    $query_old = "SELECT * FROM equipos_medicos WHERE id=:id";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->bindParam(":id", $data->id);
    $stmt_old->execute();
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);
    $data->nombre = htmlspecialchars(strip_tags($data->nombre));
    $data->marca = htmlspecialchars(strip_tags($data->marca));
    $data->modelo = !empty($data->modelo) ? htmlspecialchars(strip_tags($data->modelo)) : null;
    $data->serie = htmlspecialchars(strip_tags($data->serie));

    $manual_pdf = !empty($data->manual_pdf) ? htmlspecialchars(strip_tags($data->manual_pdf)) : null;
    $invima_pdf = !empty($data->invima_pdf) ? htmlspecialchars(strip_tags($data->invima_pdf)) : null;
    $protocolos_pdf = !empty($data->protocolos_pdf) ? htmlspecialchars(strip_tags($data->protocolos_pdf)) : null;
    $hoja_vida_pdf = !empty($data->hoja_vida_pdf) ? htmlspecialchars(strip_tags($data->hoja_vida_pdf)) : null;
    $imagen_url = !empty($data->imagen_url) ? htmlspecialchars(strip_tags($data->imagen_url)) : null;

    $guia_uso_tipo = !empty($data->guia_uso_tipo) ? htmlspecialchars(strip_tags($data->guia_uso_tipo)) : 'ninguna';
    $guia_uso_url = !empty($data->guia_uso_url) ? htmlspecialchars(strip_tags($data->guia_uso_url)) : null;
    $guia_uso_pdf = !empty($data->guia_uso_pdf) ? htmlspecialchars(strip_tags($data->guia_uso_pdf)) : null;

    // Lógica de exclusividad
    $ambulancia_id = !empty($data->ambulancia_id) ? (int)$data->ambulancia_id : null;
    $departamento_id = ($ambulancia_id === null && !empty($data->departamento_id)) ? (int)$data->departamento_id : null;
    $tipo_id = !empty($data->tipo_id) ? (int)$data->tipo_id : null;
    $periodicidad_meses = !empty($data->periodicidad_meses) ? (int)$data->periodicidad_meses : 6;

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":tipo_id", $tipo_id, PDO::PARAM_INT);
    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":marca", $data->marca);
    $stmt->bindParam(":modelo", $data->modelo);
    $stmt->bindParam(":serie", $data->serie);

    $stmt->bindParam(":manual_pdf", $manual_pdf);
    $stmt->bindParam(":invima_pdf", $invima_pdf);
    $stmt->bindParam(":protocolos_pdf", $protocolos_pdf);
    $stmt->bindParam(":hoja_vida_pdf", $hoja_vida_pdf);
    $stmt->bindParam(":guia_uso_tipo", $guia_uso_tipo);
    $stmt->bindParam(":guia_uso_url", $guia_uso_url);
    $stmt->bindParam(":guia_uso_pdf", $guia_uso_pdf);
    $stmt->bindParam(":imagen_url", $imagen_url);
    $stmt->bindParam(":periodicidad_meses", $periodicidad_meses, PDO::PARAM_INT);
    
    if ($ambulancia_id !== null) {
        $stmt->bindParam(":ambulancia_id", $ambulancia_id, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(":ambulancia_id", null, PDO::PARAM_NULL);
    }
    
    if ($departamento_id !== null) {
        $stmt->bindParam(":departamento_id", $departamento_id, PDO::PARAM_INT);
    } else {
        $stmt->bindValue(":departamento_id", null, PDO::PARAM_NULL);
    }

    if ($stmt->execute()) {
        Logger::logAction($conn, $_SESSION['user_id'], 'equipos_medicos', 'UPDATE', $data->id, $old_data, $data);

        http_response_code(200);
        echo json_encode(array("message" => "Equipo médico actualizado exitosamente."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Ocurrió un error al actualizar el equipo médico."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
