<?php
require_once '../config/db.php';
require_once '../middleware/auth.php';
require_once '../config/sheets_config.php';

// Protegemos el endpoint para que solo usuarios logueados accedan
checkAuth(); 

try {
    $data = [];
    
    if (!empty(GOOGLE_SHEETS_API_KEY)) {
        // Opción 1: Usar la API oficial v4 con API Key (Para hojas públicas con API Key)
        $url = "https://sheets.googleapis.com/v4/spreadsheets/" . GOOGLE_SHEETS_SPREADSHEET_ID . "/values/" . urlencode(GOOGLE_SHEETS_RANGE) . "?key=" . GOOGLE_SHEETS_API_KEY;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Error al conectar con Google Sheets API (HTTP $httpCode): " . $response);
        }
        
        $json = json_decode($response, true);
        if (isset($json['values'])) {
            $data = $json['values'];
        }
    } else {
        // Opción 2: Fallback a leer el CSV exportado (Requiere que el Sheet sea público)
        // Usamos el gid=1371382978 que especificaste para obtener la pestaña correcta
        $url = "https://docs.google.com/spreadsheets/d/" . GOOGLE_SHEETS_SPREADSHEET_ID . "/export?format=csv&gid=1371382978";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("No se pudo descargar la hoja de Google. Asegúrate de que los permisos estén en 'Cualquier persona con el enlace' (HTTP $httpCode). Alternativamente, configura una API_KEY en sheets_config.php");
        }
        
        // Parsear CSV usando memory stream para soportar saltos de línea internos en los campos
        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $response);
        rewind($stream);
        
        while (($row = fgetcsv($stream)) !== false) {
            // Eliminar la fila solo si está completamente en blanco
            if (array_filter($row)) {
                $data[] = $row;
            }
        }
        fclose($stream);
    }

    if (empty($data)) {
        echo json_encode(["status" => "success", "data" => []]);
        exit();
    }
    
    // Definir columnas que no se enviarán al frontend
    $columnasExcluidas = [
        "Dirección de correo electrónico", 
        "SEDE DEL CONDUCTOR:", 
        "TURNO REALIZADO:", 
        "POR FAVOR ADJUNTE IMAGENES", 
        "OBSERVACIONES",
        "OBSERVACIONES (En caso de ser necesario de una breve descripción del funcionamiento de los equipos, de no ser así escribir NA)",
        "POR FAVOR ADJUNTE IMAGENES (Fotos internas de la cabina del conductor y del habitáculo del paciente)"
    ];

    // Transformar de array de arrays a array de objetos asociativos
    $headers = array_shift($data);
    $debug_headers = $headers; // Guardamos los originales para debug en frontend
    
    // Obtener parámetros de fecha
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] . ' 00:00:00' : '1970-01-01 00:00:00';
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] . ' 23:59:59' : '2099-12-31 23:59:59';
    $startTimestamp = strtotime($startDate);
    $endTimestamp = strtotime($endDate);

    // Buscar cuál es el índice de la columna "Marca temporal"
    $marcaTemporalIndex = -1;
    foreach ($headers as $index => $header) {
        if (stripos(trim($header), 'Marca temporal') !== false || stripos(trim($header), 'Timestamp') !== false) {
            $marcaTemporalIndex = $index;
            break;
        }
    }

    $result = [];
    
    foreach ($data as $row) {
        $item = [];
        
        // --- Filtrado por Fecha ---
        // Exclusivo de Google Forms: La primera columna suele ser "Marca temporal" (ej: "15/03/2026 14:30:00")
        if ($marcaTemporalIndex !== -1 && isset($row[$marcaTemporalIndex]) && !empty(trim($row[$marcaTemporalIndex]))) {
            $fechaTexto = trim($row[$marcaTemporalIndex]);
            // Convertir de "dd/mm/yyyy hh:mm:ss" a algo que strtotime entienda "dd-mm-yyyy hh:mm:ss"
            $fechaTextoCorregida = str_replace('/', '-', $fechaTexto);
            $rowTimestamp = strtotime($fechaTextoCorregida);
            
            // Si tiene fecha válida y no cae en el rango, omitir toda la fila
            if ($rowTimestamp !== false && ($rowTimestamp < $startTimestamp || $rowTimestamp > $endTimestamp)) {
                continue; 
            }
        }
        
        // --- Construcción de columnas a mostrar ---
        foreach ($headers as $index => $header) {
            $headerKey = trim($header);
            // Ignorar columnas vacías y las que han sido explícitamente excluidas
            if (!empty($headerKey) && !in_array($headerKey, $columnasExcluidas)) {
                $item[$headerKey] = isset($row[$index]) ? trim($row[$index]) : '';
            }
        }
        
        // Si el item tiene claves, agregarlo al resultado
        if (!empty($item)) {
            $result[] = $item;
        }
    }
    
    echo json_encode([
        "status" => "success", 
        "data" => $result,
        "debug_headers" => $debug_headers
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
