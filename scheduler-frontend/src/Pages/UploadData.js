import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../Styles/UploadData.css';

function UploadData() {
  const [sheetsData, setSheetsData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const allSheets = {};
      workbook.SheetNames.forEach((name) => {
        const worksheet = workbook.Sheets[name];
        allSheets[name] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      });
      setSheetsData(allSheets);
      setSheetNames(workbook.SheetNames);
      setSelectedSheet(workbook.SheetNames[0] || '');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="upload-container">
      <div className="upload-header-row">
        <h2 className="upload-title">Upload de Ficheiro Excel</h2>
        <input
          className="upload-input"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
        />
        <button
          className="download-preset-btn"
          onClick={() => {
            const link = document.createElement('a');
            link.href = process.env.PUBLIC_URL + '/preset.xlsx';
            link.download = 'preset.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download Preset File
        </button>
        <button
          className="return-schedule-btn"
          onClick={() => window.location.href = 'http://localhost:3000/schedule'}
        >
          Voltar ao Horário
        </button>
      </div>
      {sheetNames.length > 0 && (
        <div className="sheet-tabs">
          {sheetNames.map((name) => (
            <button
              key={name}
              className={`sheet-tab${selectedSheet === name ? ' active' : ''}`}
              onClick={() => setSelectedSheet(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      {selectedSheet && sheetsData[selectedSheet] && (
        <div className="upload-table-container">
          <h3>Folha: {selectedSheet}</h3>
          <table className="upload-table">
            <tbody>
              {sheetsData[selectedSheet].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const newSheetsData = { ...sheetsData };
                        const newSheet = newSheetsData[selectedSheet].map(r => [...r]);
                        newSheet[i][j] = e.target.innerText;
                        newSheetsData[selectedSheet] = newSheet;
                        setSheetsData(newSheetsData);
                      }}
                      style={{ minWidth: 0, padding: '4px 8px' }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedSheet && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
          <button
            className="send-sheet-btn"
            onClick={() => {
              if (window.confirm(`Tem a certeza que quer carregar a folha "${selectedSheet}" na base de dados?`)) {
                //TODO: lógica de envio aqui
              }
            }}
          >
            Carregar folha "{selectedSheet}" na base de dados
          </button>
          <button
            className="send-all-btn"
            onClick={() => {
              if (window.confirm('Tem a certeza que quer carregar todas as folhas na base de dados?')) {
                //TODO: lógica de envio aqui
              }
            }}
          >
            Carregar todas as folhas na base de dados
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadData;
