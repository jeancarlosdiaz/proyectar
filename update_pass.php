<?php
require_once 'api/config/db.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Hash generado en el paso anterior para 'admin123'
    $new_hash = '$2y$10$OVo8dgv1Nft9JQHFPO01NuOP8Eho/jKelqnz/iaxa4b3ShkTzK8C.';
    
    $query = "UPDATE usuarios SET password_hash = :hash WHERE email = 'admin@sistema.com'";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':hash', $new_hash);
    
    if ($stmt->execute()) {
        echo "Contrasena actualizada exitosamente en la base de datos.";
    } else {
        echo "Error al actualizar la contrasena.";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
