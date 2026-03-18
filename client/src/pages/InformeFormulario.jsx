import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const InformeFormulario = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fechas por defecto: Mes y Año Actual
  const hoy = new Date();
  const [selectedMonth, setSelectedMonth] = useState((hoy.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(hoy.getFullYear().toString());

  // Generar opciones de años
  const years = [];
  for (let i = 2025; i <= hoy.getFullYear(); i++) {
    years.push(i);
  }

  const mesesInfo = [
    { id: '1', nombre: 'Enero' }, { id: '2', nombre: 'Febrero' }, { id: '3', nombre: 'Marzo' },
    { id: '4', nombre: 'Abril' }, { id: '5', nombre: 'Mayo' }, { id: '6', nombre: 'Junio' },
    { id: '7', nombre: 'Julio' }, { id: '8', nombre: 'Agosto' }, { id: '9', nombre: 'Septiembre' },
    { id: '10', nombre: 'Octubre' }, { id: '11', nombre: 'Noviembre' }, { id: '12', nombre: 'Diciembre' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calcular primer y último día del mes seleccionado
      const yearInt = parseInt(selectedYear);
      const monthInt = parseInt(selectedMonth);
      const primerDia = new Date(yearInt, monthInt - 1, 1);
      const ultimoDia = new Date(yearInt, monthInt, 0); // 0 obtiene el último día del mes anterior (mes actual en index)

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      const startDate = formatDate(primerDia);
      const endDate = formatDate(ultimoDia);

      // Hacemos la petición al nuevo endpoint de reportes externos
      const response = await axios.get('http://localhost/proyectar/api/reportes_externos/read_sheets.php', {
        params: { start_date: startDate, end_date: endDate },
        withCredentials: true
      });

      if (response.data.status === 'success') {
        if (response.data.debug_headers) {
          console.log("🔍 ENCABEZADOS ORIGINALES DE GOOGLE SHEETS:", response.data);
        }
        const sheetData = response.data.data;
        setData(sheetData);
        // Extraer encabezados de la primera fila si hay datos
        if (sheetData.length > 0) {
          setHeaders(Object.keys(sheetData[0]));
        }
      } else {
        setError(response.data.message || 'Error al cargar los datos.');
      }
    } catch (err) {
      console.error("Error fetching sheets data:", err);
      setError(err.response?.data?.message || err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) return;

    // --- PROGRAMA AQUÍ EL DISEÑO DE TU EXCEL ---
    // Agrega o quita líneas según necesites. 
    // gSheet: Nombre exacto que viene de Google Sheets.
    // excel: Nombre elegante que quieres que salga en el archivo.
    const configuracionColumnas = [
        { gSheet: "Marca temporal", excel: "FECHA/HORA" },
        { gSheet: "NOMBRE DEL CONDUCTOR:", excel: "CONDUCTOR" },
        { gSheet: "CEDULA DEL CONDUCTOR:", excel: "CÉDULA" },
        { gSheet: "PLACA:", excel: "PLACA MÓVIL" },
        { gSheet: "KILOMETRAJE:", excel: "KM ACTUAL" },
        { gSheet: "ESTADO DEL VEHICULO:", excel: "ESTADO" }
        // Agrega más columnas según veas en la consola (o en los títulos de tu tabla)
    ];

    // Buscar dinámicamente la columna de cédula para separar en pestañas (hojas)
    const cedulaKey = headers.find(h => h.toUpperCase().includes('CEDULA')) || "CEDULA DEL CONDUCTOR:";

    // Agrupar los datos
    const groupedData = {};
    data.forEach(row => {
      let cedula = row[cedulaKey];
      cedula = cedula ? cedula.toString().trim() : 'Sin_Cedula';
      
      const safeSheetName = cedula.substring(0, 31).replace(/[\[\]\*\\\/\?]/g, '');

      if (!groupedData[safeSheetName]) {
        groupedData[safeSheetName] = [];
      }

      // --- AQUÍ SE CONSTRUYE LA FILA PROGRAMADA ---
      const filaPersonalizada = {};
      
      // 1. Insertamos las columnas en el orden estricto de tu lista "configuracionColumnas"
      configuracionColumnas.forEach(col => {
          if (row[col.gSheet] !== undefined) {
              filaPersonalizada[col.excel] = row[col.gSheet] || '-';
          } else {
              filaPersonalizada[col.excel] = '-'; // Si la columna no vino en esta fila, ponemos un guión
          }
      });
      
      // 2. (Opcional) Las columnas de Sheets que NO mapeaste arriba quedan ocultas del Excel.
      // Si quisieras que el resto se adjunte automáticamente al final, podrías hacer un bucle aquí.

      groupedData[safeSheetName].push(filaPersonalizada);
    });

    const wb = XLSX.utils.book_new();

    Object.keys(groupedData).forEach(cedula => {
      const sheetData = groupedData[cedula];
      const ws = XLSX.utils.json_to_sheet(sheetData);
      
      // Dar un poco de ancho automático a las columnas del Excel
      const wscols = configuracionColumnas.map(() => ({ wch: 22 }));
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, cedula);
    });

    // Guardar el archivo Excel
    const mesNombre = mesesInfo.find(m => m.id === selectedMonth)?.nombre || selectedMonth;
    const fileName = `Reporte_${mesNombre}_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="text-primary-institucional mb-0">
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
            Informe de Formulario Externo
          </h2>
          <p className="text-muted mt-1 mb-0">Datos sincronizados desde Google Sheets</p>
        </div>

        <div className="d-flex align-items-center gap-2 bg-light p-2 rounded border">
          <div className="d-flex align-items-center">
            <label className="text-muted small me-2 mb-0 fw-bold">Mes:</label>
            <select
              className="form-select form-select-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {mesesInfo.map(mes => (
                <option key={mes.id} value={mes.id}>{mes.nombre}</option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center">
            <label className="text-muted small me-2 mb-0 fw-bold">Año:</label>
            <select
              className="form-select form-select-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-sm ms-2 d-flex align-items-center" onClick={fetchData} disabled={loading}>
            <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'lh-spin' : ''}`}></i>
            {loading ? 'Cargando..' : 'Filtrar'}
          </button>
          <button 
            className="btn btn-success btn-sm ms-2 d-flex align-items-center" 
            onClick={exportToExcel} 
            disabled={loading || data.length === 0}
            title="Exportar archivo de Excel con hojas por conductor"
          >
            <i className="bi bi-file-earmark-excel me-1"></i>
            Descargar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary-institucional" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Conectando con Google Sheets...</p>
            </div>
          ) : data.length === 0 && !error ? (
            <div className="text-center p-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No se encontraron datos</h5>
              <p className="text-muted mb-0">La hoja de cálculo seleccionada está vacía o no tiene el formato esperado.</p>
            </div>
          ) : data.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-bordered mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="text-center" style={{ width: '50px' }}>#</th>
                    {headers.map((header, index) => (
                      <th scope="col" key={index} className="text-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="text-center text-muted fw-bold">{rowIndex + 1}</td>
                      {headers.map((header, colIndex) => (
                        <td key={colIndex}>{row[header] || <span className="text-muted fst-italic">-</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        {!loading && data.length > 0 && (
          <div className="card-footer bg-light text-end text-muted small py-3">
            Total de registros: <span className="fw-bold">{data.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformeFormulario;
