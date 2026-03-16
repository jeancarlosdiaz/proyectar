<?php
require_once '../config/db.php';

session_start();

if (isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(array(
        "isLoggedIn" => true,
        "user" => array(
            "id" => $_SESSION['user_id'],
            "nombre" => $_SESSION['user_nombre'],
            "rol" => $_SESSION['user_rol']
        )
    ));
} else {
    http_response_code(401);
    echo json_encode(array(
        "isLoggedIn" => false,
        "message" => "No hay sesión activa."
    ));
}
?>
