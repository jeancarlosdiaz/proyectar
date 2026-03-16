<?php
require_once '../config/db.php';
require_once '../utils/Logger.php';

// Iniciar o reanudar sesión
session_start();

// Leer datos en formato JSON enviados desde React
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $db = new Database();
    $conn = $db->getConnection();

    $query = "SELECT id, nombre, email, password_hash, rol, cargo, permisos FROM usuarios WHERE email = :email LIMIT 0,1";

    $stmt = $conn->prepare($query);

    // Sanitizar
    $email = htmlspecialchars(strip_tags($data->email));
    $stmt->bindParam(":email", $email);

    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $password_hash = $row['password_hash'];

        // Verificar contraseña
        if (password_verify($data->password, $password_hash)) {
            // Guardar datos en la sesión
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_rol'] = $row['rol'];
            $_SESSION['user_nombre'] = $row['nombre'];
            $_SESSION['user_permisos'] = $row['permisos'];


            // Registrar inicio de sesión en auditoría
            Logger::logAction($conn, $row['id'], 'sesion', 'LOGIN', null, null, ['email' => $row['email'], 'ip' => $_SERVER['REMOTE_ADDR']]);

            http_response_code(200);
            echo json_encode(array(
                "message" => "Login exitoso.",
                "user" => array(
                    "id" => $row['id'],
                    "nombre" => $row['nombre'],
                    "email" => $row['email'],
                    "rol" => $row['rol'],
                    "cargo" => $row['cargo'],
                    "permisos" => json_decode($row['permisos'])
                )

            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Contraseña incorrecta."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "El usuario no existe."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Datos incompletos."));
}
?>
