<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../utils/Logger.php';

checkAdmin();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->nombre) && !empty($data->email) && !empty($data->password) && !empty($data->rol)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "INSERT INTO usuarios SET nombre=:nombre, email=:email, cargo=:cargo, password_hash=:password, rol=:rol, permisos=:permisos";
    $stmt = $conn->prepare($query);

    $nombre = htmlspecialchars(strip_tags($data->nombre));
    $email = htmlspecialchars(strip_tags($data->email));
    $cargo = !empty($data->cargo) ? htmlspecialchars(strip_tags($data->cargo)) : null;
    $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
    $rol = htmlspecialchars(strip_tags($data->rol));
    $permisos = isset($data->permisos) ? json_encode($data->permisos) : null;

    $stmt->bindParam(":nombre", $nombre);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":cargo", $cargo);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":rol", $rol);
    $stmt->bindParam(":permisos", $permisos);

    if ($stmt->execute()) {
        $last_id = $conn->lastInsertId();
        Logger::logAction($conn, $_SESSION['user_id'], 'usuarios', 'CREATE', $last_id, null, ["nombre" => $nombre, "email" => $email]);
        
        http_response_code(201);
        echo json_encode(array("message" => "Usuario creado exitosamente."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Error al crear usuario. El correo podría estar duplicado."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
