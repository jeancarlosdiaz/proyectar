<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('multimedia', 'crear');

$targetDir = "../../uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivo'])) {
    $files = $_FILES['archivo'];
    $uploadedCount = 0;
    $errors = [];

    // Normalizar la estructura de $_FILES si se suben múltiples archivos
    $fileEntries = [];
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $fileEntries[] = [
                'name'     => $files['name'][$i],
                'type'     => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error'    => $files['error'][$i],
                'size'     => $files['size'][$i]
            ];
        }
    } else {
        $fileEntries[] = $files;
    }

    try {
        $db = new Database();
        $conn = $db->getConnection();
        $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];

        foreach ($fileEntries as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $errors[] = "Error en archivo " . $file['name'] . ": " . $file['error'];
                continue;
            }

            $originalName = $file['name'];
            $tmpName = $file['tmp_name'];
            $fileSize = $file['size'];
            $fileType = $file['type'];
            $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

            if (!in_array($ext, $allowedTypes)) {
                $errors[] = "Tipo de archivo no permitido: $originalName";
                continue;
            }

            // Sanitizar nombre
            $filename = pathinfo($originalName, PATHINFO_FILENAME);
            $cleanName = strtolower($filename);
            $cleanName = str_replace(" ", "-", $cleanName);
            $cleanName = preg_replace("/[^a-z0-9\-]/", "", $cleanName);
            $cleanName = preg_replace("/-+/", "-", $cleanName);
            $cleanName = trim($cleanName, "-");
            if (empty($cleanName)) { $cleanName = "archivo-" . uniqid(); }
            
            $serverName = $cleanName . "." . $ext;
            $counter = 1;
            while (file_exists($targetDir . $serverName)) {
                $serverName = $cleanName . "-$counter." . $ext;
                $counter++;
            }
            
            $targetFilePath = $targetDir . $serverName;

            if (move_uploaded_file($tmpName, $targetFilePath)) {
                $query = "INSERT INTO archivos SET nombre_original=:norig, nombre_servidor=:nserv, tipo=:tipo, tamano=:tamano, usuario_id=:user_id";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(":norig", $originalName);
                $stmt->bindParam(":nserv", $serverName);
                $stmt->bindParam(":tipo", $fileType);
                $stmt->bindParam(":tamano", $fileSize);
                $stmt->bindParam(":user_id", $_SESSION['user_id']);

                if ($stmt->execute()) {
                    $last_id = $conn->lastInsertId();
                    Logger::logAction($conn, $_SESSION['user_id'], 'archivos', 'CREATE', $last_id, null, ["archivo" => $originalName]);
                    $uploadedCount++;
                } else {
                    unlink($targetFilePath);
                    $errors[] = "Error BD con $originalName";
                }
            } else {
                $errors[] = "Error al mover $originalName";
            }
        }

        if ($uploadedCount > 0) {
            http_response_code(201);
            echo json_encode([
                "message" => "$uploadedCount archivo(s) subido(s) exitosamente.",
                "errors" => $errors
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "No se pudo subir ningún archivo.", "errors" => $errors]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error de servidor: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Petición inválida."]);
}
?>
