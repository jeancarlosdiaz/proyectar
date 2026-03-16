<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';

checkAuth();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "ID de departamento no proporcionado."]);
    exit;
}

// Verificar que ZipArchive esté disponible
if (!class_exists('ZipArchive')) {
    http_response_code(500);
    echo json_encode(["message" => "El servidor no soporta la creación de archivos ZIP (ZipArchive no disponible)."]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Info básica del departamento
    $stmt = $conn->prepare("SELECT d.*, s.nombre as sede_nombre, s.ciudad as sede_ciudad
                             FROM departamentos d
                             LEFT JOIN sedes s ON d.sede_id = s.id
                             WHERE d.id = :id");
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $departamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$departamento) {
        http_response_code(404);
        echo json_encode(["message" => "Departamento no encontrado."]);
        exit;
    }

    // 2. Equipos médicos asignados
    // Nota: Reutilizamos la lógica de tipos de equipos
    $stmt3 = $conn->prepare("SELECT e.*, te.nombre as tipo_nombre FROM equipos_medicos e LEFT JOIN tipos_equipos te ON e.tipo_id = te.id WHERE e.departamento_id = :id");
    $stmt3->bindParam(':id', $id);
    $stmt3->execute();
    $equipos = $stmt3->fetchAll(PDO::FETCH_ASSOC);

    // Crear archivo ZIP temporal
    $zipName = 'Expediente_Depto_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $departamento['nombre']) . '_Sede_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $departamento['sede_nombre']) . '.zip';
    $tempZip = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $zipName;

    $zip = new ZipArchive();
    if ($zip->open($tempZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        http_response_code(500);
        echo json_encode(["message" => "No se pudo crear el archivo ZIP."]);
        exit;
    }

    $baseDir = 'Expediente_Depto_' . ($departamento['nombre'] ?? 'SIN_NOMBRE') . '/';

    // ---- Resumen del Departamento como TXT ----
    $infoTxt  = "====================================================\n";
    $infoTxt .= "  EXPEDIENTE DE DEPARTAMENTO CORPORATIVO\n";
    $infoTxt .= "====================================================\n\n";
    $infoTxt .= "INFORMACIÓN GENERAL\n";
    $infoTxt .= "--------------------\n";
    $infoTxt .= "Nombre Departamento : " . ($departamento['nombre'] ?? '') . "\n";
    $infoTxt .= "Sede Operativa      : " . ($departamento['sede_nombre'] ?? '') . " - " . ($departamento['sede_ciudad'] ?? '') . "\n";
    $infoTxt .= "Fecha Generación    : " . date('Y-m-d H:i:s') . "\n\n";

    $infoTxt .= "EQUIPOS MÉDICOS ASIGNADOS (" . count($equipos) . ")\n";
    $infoTxt .= "-----------------\n";
    if (empty($equipos)) {
        $infoTxt .= "No hay equipos registrados en este departamento.\n";
    } else {
        foreach ($equipos as $eq) {
            $infoTxt .= "- " . $eq['nombre'] . " | " . ($eq['tipo_nombre'] ?? '') . " | Marca: " . ($eq['marca'] ?? '') . " | Modelo: " . ($eq['modelo'] ?? '') . " | Serie: " . ($eq['serie'] ?? '') . "\n";
        }
    }

    $zip->addFromString($baseDir . 'INFO_DEPARTAMENTO.txt', $infoTxt);

    $uploadBase = dirname(__DIR__, 2) . '/uploads/';

    // ---- Carpeta por cada Equipo Médico ----
    foreach ($equipos as $eq) {
        $eqFolder = $baseDir . 'Equipos/' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $eq['nombre'] . '_' . $eq['serie']) . '/';

        // Resumen del equipo
        $eqTxt  = "EQUIPO: " . $eq['nombre'] . "\n";
        $eqTxt .= "Tipo          : " . ($eq['tipo_nombre'] ?? '') . "\n";
        $eqTxt .= "Marca         : " . ($eq['marca'] ?? '') . "\n";
        $eqTxt .= "Modelo        : " . ($eq['modelo'] ?? '') . "\n";
        $eqTxt .= "Serie         : " . ($eq['serie'] ?? '') . "\n";
        $eqTxt .= "Periodicidad  : " . ($eq['periodicidad_meses'] ?? '') . " meses\n";

        if (!empty($eq['guia_uso_tipo']) && $eq['guia_uso_tipo'] === 'link' && !empty($eq['guia_uso_url'])) {
            $eqTxt .= "Guía de Uso   : Ver archivo GUIA_DE_USO.txt\n";
            $zip->addFromString($eqFolder . 'GUIA_DE_USO.txt', "GUÍA DE USO PARA " . $eq['nombre'] . ":\n\nEnlace: " . $eq['guia_uso_url']);
        }

        // ---- Historial de Calibraciones ----
        $stmtCalib = $conn->prepare("SELECT * FROM calibraciones WHERE equipo_id = :eq_id ORDER BY fecha_calibracion DESC");
        $stmtCalib->bindParam(':eq_id', $eq['id']);
        $stmtCalib->execute();
        $calibraciones = $stmtCalib->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($calibraciones)) {
            $eqTxt .= "\nHISTORIAL DE CALIBRACIONES\n";
            $eqTxt .= "---------------------------\n";
            foreach ($calibraciones as $calib) {
                $eqTxt .= "- Fecha: " . $calib['fecha_calibracion'] . " | Próxima: " . $calib['proxima_fecha'];
                if (!empty($calib['observaciones'])) {
                    $eqTxt .= " | Obs: " . $calib['observaciones'];
                }
                $eqTxt .= "\n";

                // Agregar certificados de la calibración al ZIP
                if (!empty($calib['documento_pdf'])) {
                    $paths = explode(';', $calib['documento_pdf']);
                    $validPaths = array_filter($paths, 'trim');
                    $count = 1;
                    $hasMultiple = count($validPaths) > 1;
                    
                    foreach ($validPaths as $path) {
                        $filePath = $uploadBase . basename(trim($path));
                        if (file_exists($filePath)) {
                            $ext = pathinfo($filePath, PATHINFO_EXTENSION);
                            $fileName = $hasMultiple ? "Calibracion_{$calib['fecha_calibracion']}_{$count}.{$ext}" : "Calibracion_{$calib['fecha_calibracion']}.{$ext}";
                            $zip->addFile($filePath, $eqFolder . 'Calibraciones/' . $fileName);
                            $count++;
                        }
                    }
                }
            }
        } else {
            $eqTxt .= "\nNo hay calibraciones registradas.\n";
        }

        $zip->addFromString($eqFolder . 'INFO_EQUIPO.txt', $eqTxt);

        // Archivos adjuntos del equipo
        $archivosEquipo = [
            'Hoja de Vida' => $eq['hoja_vida_pdf'] ?? '',
            'Guia de Uso'  => $eq['guia_uso_pdf'] ?? '',
            'Manual'     => $eq['manual_pdf'] ?? '',
            'INVIMA'     => $eq['invima_pdf'] ?? '',
            'Protocolos' => $eq['protocolos_pdf'] ?? '',
        ];
        foreach ($archivosEquipo as $label => $pathsString) {
            if (!empty($pathsString)) {
                $paths = explode(';', $pathsString);
                $validPaths = array_filter($paths, 'trim');
                $count = 1;
                $hasMultiple = count($validPaths) > 1;
                
                foreach ($validPaths as $path) {
                    $filePath = $uploadBase . basename(trim($path));
                    if (file_exists($filePath)) {
                        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
                        $fileName = $hasMultiple ? "{$label}_{$count}.{$ext}" : "{$label}.{$ext}";
                        $zip->addFile($filePath, $eqFolder . $fileName);
                        $count++;
                    }
                }
            }
        }
    }

    $zip->close();

    // Enviar el ZIP al cliente
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $zipName . '"');
    header('Content-Length: ' . filesize($tempZip));
    header('Pragma: no-cache');
    header('Expires: 0');
    readfile($tempZip);
    unlink($tempZip); // Limpiar archivo temporal

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error al generar el ZIP: " . $e->getMessage()]);
}
?>
