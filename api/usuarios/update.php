<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->nombre) && !empty($data->email) && !empty($data->rol)) {
    $db = new Database();
    $conn = $db->getConnection();

    // Obtener datos actuales para auditoría
    $query_old = "SELECT * FROM usuarios WHERE id = ?";
    $stmt_old = $conn->prepare($query_old);
    $stmt_old->execute([$data->id]);
    $old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

    $query = "UPDATE usuarios SET nombre=:nombre, email=:email, cargo=:cargo, rol=:rol, permisos=:permisos";
    
    // Si se envía contraseña, actualizarla
    if (!empty($data->password)) {
        $query .= ", password_hash=:password";
    }
    
    $query .= " WHERE id=:id";
    
    $stmt = $conn->prepare($query);

    $nombre = htmlspecialchars(strip_tags($data->nombre));
    $email = htmlspecialchars(strip_tags($data->email));
    $cargo = !empty($data->cargo) ? htmlspecialchars(strip_tags($data->cargo)) : null;
    $rol = htmlspecialchars(strip_tags($data->rol));
    $permisos = isset($data->permisos) ? json_encode($data->permisos) : null;

    $stmt->bindParam(":id", $data->id);
    $stmt->bindParam(":nombre", $nombre);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":cargo", $cargo);
    $stmt->bindParam(":rol", $rol);
    $stmt->bindParam(":permisos", $permisos);

    if (!empty($data->password)) {
        $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt->bindParam(":password", $password_hash);
    }

    if ($stmt->execute()) {
        Logger::logAction($conn, $_SESSION['user_id'], 'usuarios', 'UPDATE', $data->id, $old_data, $data);
        http_response_code(200);
        echo json_encode(array("message" => "Usuario actualizado exitosamente."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Error al actualizar usuario."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
