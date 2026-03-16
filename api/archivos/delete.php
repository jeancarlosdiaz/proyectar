<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkPermission('multimedia', 'eliminar');

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $db = new Database();
        $conn = $db->getConnection();

        // 1. Obtener info para borrar archivo físico
        $query = "SELECT nombre_servidor, nombre_original FROM archivos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->execute();
        $file = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($file) {
            $filePath = "../../uploads/" . $file['nombre_servidor'];
            
            // 2. Borrar de BD
            $deleteQuery = "DELETE FROM archivos WHERE id = :id";
            $delStmt = $conn->prepare($deleteQuery);
            $delStmt->bindParam(":id", $data->id);
            
            if ($delStmt->execute()) {
                // 3. Borrar físico si existe
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                
                Logger::logAction($conn, $_SESSION['user_id'], 'archivos', 'DELETE', $data->id, $file, null);
                
                http_response_code(200);
                echo json_encode(["message" => "Archivo eliminado exitosamente."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Ocurrió un error al eliminar el registro."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Archivo no encontrado."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error de servidor: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "ID no proporcionado."]);
}
?>
