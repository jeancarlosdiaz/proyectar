<?php
class Logger {
    public static function logAction($conn, $usuario_id, $tabla_afectada, $accion, $registro_id = null, $valor_anterior = null, $valor_nuevo = null) {
        try {
            $query = "INSERT INTO auditoria (usuario_id, tabla_afectada, accion, registro_id, valor_anterior, valor_nuevo) 
                      VALUES (:usuario_id, :tabla_afectada, :accion, :registro_id, :valor_anterior, :valor_nuevo)";
            $stmt = $conn->prepare($query);
            
            // Convertir arrays a JSON de forma segura, respetando caracteres unicode (\u00fc -> ü)
            $ant = $valor_anterior ? json_encode($valor_anterior, JSON_UNESCAPED_UNICODE) : null;
            $nue = $valor_nuevo ? json_encode($valor_nuevo, JSON_UNESCAPED_UNICODE) : null;
            
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(':tabla_afectada', $tabla_afectada);
            $stmt->bindParam(':accion', $accion);
            if ($registro_id) {
                $stmt->bindParam(':registro_id', $registro_id, PDO::PARAM_INT);
            } else {
                $stmt->bindValue(':registro_id', null, PDO::PARAM_NULL);
            }
            $stmt->bindParam(':valor_anterior', $ant);
            $stmt->bindParam(':valor_nuevo', $nue);
            
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Error guardando auditoria: " . $e->getMessage());
            return false;
        }
    }
}
?>
