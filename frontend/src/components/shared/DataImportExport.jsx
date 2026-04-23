import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './DataImportExport.css';

const DataImportExport = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('tf_token');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [importType, setImportType] = useState('projects');
  const [exportType, setExportType] = useState('projects');
  const [exportFormat, setExportFormat] = useState('json');
  const [uploadFile, setUploadFile] = useState(null);

  // URL de API Gateway (obtener del .env)
  const API_BASE_URL =
    import.meta.env.VITE_IMPORT_EXPORT_API_URL ||
    import.meta.env.VITE_IMPORT_EXPORT_API ||
    import.meta.env.REACT_APP_IMPORT_EXPORT_API ||
    'http://localhost:3001';

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!uploadFile) {
      setMessage('❌ Por favor selecciona un archivo para importar');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const fileContent = await uploadFile.text();
      let records = [];

      // Parse JSON o CSV
      if (uploadFile.name.endsWith('.json')) {
        const data = JSON.parse(fileContent);
        records = Array.isArray(data) ? data : data.records || [];
      } else if (uploadFile.name.endsWith('.csv')) {
        // Parse CSV simple
        const lines = fileContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const record = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });
          records.push(record);
        }
      } else {
        setMessage('❌ Formato de archivo no válido. Use JSON o CSV');
        setLoading(false);
        return;
      }

      if (records.length === 0) {
        setMessage('❌ El archivo no contiene registros válidos');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: importType,
          records: records,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Importación exitosa: ${data.imported}/${data.total} registros importados`);
        if (data.failed_records && data.failed_records.length > 0) {
          setMessage(prev => prev + `\n⚠️ Registros fallidos: ${data.failed_records.length}`);
        }
        setUploadFile(null);
      } else {
        setMessage(`❌ Error: ${data.error || 'Error en la importación'}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = new URL(`${API_BASE_URL}/export`);
      url.searchParams.append('type', exportType);
      url.searchParams.append('format', exportFormat);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setMessage(`❌ Error: ${data.error || 'Error en la exportación'}`);
        setLoading(false);
        return;
      }

      // Descargar archivo
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `export-${exportType}-${Date.now()}.${exportFormat === 'csv' ? 'csv' : 'json'}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(link);

      setMessage(`✅ Exportación exitosa: Archivo descargado`);
    } catch (error) {
      console.error('Export error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="data-import-export">
        <div className="auth-required">
          <p>Debes iniciar sesión para usar las funciones de importación y exportación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-import-export">
      <h1>Importar / Exportar Datos</h1>
      
      <div className="section">
        <h2>📥 Importar Datos</h2>
        <form onSubmit={handleImport}>
          <div className="form-group">
            <label htmlFor="import-type">Tipo de Datos:</label>
            <select
              id="import-type"
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              disabled={loading}
            >
              <option value="projects">Proyectos</option>
              <option value="tasks">Tareas</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="upload-file">Selecciona archivo (JSON o CSV):</label>
            <input
              id="upload-file"
              type="file"
              accept=".json,.csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '⏳ Importando...' : '📤 Importar'}
          </button>
        </form>
      </div>

      <div className="section">
        <h2>📤 Exportar Datos</h2>
        <form onSubmit={handleExport}>
          <div className="form-group">
            <label htmlFor="export-type">Tipo de Datos:</label>
            <select
              id="export-type"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              disabled={loading}
            >
              <option value="projects">Proyectos</option>
              <option value="tasks">Tareas</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="export-format">Formato:</label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              disabled={loading}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-success">
            {loading ? '⏳ Exportando...' : '💾 Exportar'}
          </button>
        </form>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('⚠️') ? 'warning' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="info">
        <h3>ℹ️ Información</h3>
        <ul>
          <li>Los archivos JSON deben ser un array de objetos o un objeto con clave "records"</li>
          <li>Los archivos CSV deben tener encabezados en la primera fila</li>
          <li>Los datos se validan automáticamente en el servidor</li>
          <li>Se mantiene un registro de auditoría en S3</li>
        </ul>
      </div>
    </div>
  );
};

export default DataImportExport;
