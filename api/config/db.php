<?php
// Configuración de los encabezados CORS para que solo el dominio de React pueda hacer peticiones al backend
header("Access-Control-Allow-Origin: http://localhost:5173"); // Cambiar si React puerto es diferente
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Responder de inmediato a las solicitudes "preflight" de CORS (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "localhost";
    private $db_name = "sistema_ambulancias";
    private $username = "root"; // Ajustar si es necesario en XAMPP suele ser root sin contraseña
    private $password = ""; 
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // Uso de PDO para protección contra Inyección SQL y sentencias preparadas
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // En producción, es recomendable registrar el error en un log y no mostrarlo directamente
            echo "Error de conexión: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>
