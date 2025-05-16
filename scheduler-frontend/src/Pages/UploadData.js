import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../Styles/UploadData.css';

function UploadData() {
  const [tableData, setTableData] = useState(null);
  const [sheetName, setSheetName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      setSheetName(firstSheet);
      const worksheet = workbook.Sheets[firstSheet];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setTableData(json);
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
      {tableData && (
        <div className="upload-table-container">
          <h3>Primeira folha: {sheetName}</h3>
          <table className="upload-table">
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UploadData;
