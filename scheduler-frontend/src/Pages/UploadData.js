import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../Styles/UploadData.css';
import excelUploadService from '../services/excelUploadService';

function UploadData() {
  const [sheetsData, setSheetsData] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [showHelp, setShowHelp] = useState(false);

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
          Ficheiro Modelo
        </button>
        <button
          className="return-schedule-btn"
          onClick={() => window.location.href = 'http://localhost:3000/schedule'}
        >
          Voltar ao Horário
        </button>
        <button
          className="help-btn"
          onClick={() => setShowHelp(true)}
        >
          Ajuda - Como usar?
        </button>
      </div>
      {showHelp && (
        <div className="help-modal-bg" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <h2>Ajuda: Upload de Ficheiro Excel</h2>
            <p><u>Se as páginas uploaded não contiverem as mesmas colunas apresentadas no ficheiro modelo, o upload <b>falhará.</b></u></p>
            <p>Para facilitar este processo, é-lhe fornecido um ficheiro modelo, acessível nesta página.</p>
            <p><b>Formato esperado:</b></p>
            <ul>
              <li>O ficheiro deve ser do tipo <b>.xlsx</b> ou <b>.xls</b>.</li>
              <li>A primeira linha de cada folha deve conter os nomes das colunas.</li>
              <li>As folhas devem conter dados tabulares, sem células mescladas.</li>
            </ul>

            <p><b>Dicas de uso:</b></p>
            <ul>
              <li>Verifique se não há células importantes, vazias.</li>
              <li>Pode editar os dados diretamente na tabela antes de os carregar.</li>
              <li>Use o botão "Ficheiro Modelo" para obter um modelo de ficheiro.</li>
              <li>Após editar, pode exportar os dados para um novo Excel.</li>
            </ul>
            <button className="close-help-btn" onClick={() => setShowHelp(false)}>Fechar</button>
          </div>
        </div>
      )}
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
            onClick={async () => {
              if (window.confirm(`Tem a certeza que quer carregar a folha "${selectedSheet}" na base de dados?`)) {
                try {
                  await excelUploadService.upload({ [selectedSheet]: sheetsData[selectedSheet] });
                  alert('Folha carregada com sucesso!');
                } catch (e) {
                  alert('Erro ao carregar folha!');
                }
              }
            }}
          >
            Carregar folha "{selectedSheet}" na base de dados
          </button>
          <button
            className="send-all-btn"
            onClick={async () => {
              if (window.confirm('Tem a certeza que quer carregar todas as folhas na base de dados?')) {
                try {
                  await excelUploadService.upload(sheetsData);
                  alert('Todas as folhas carregadas com sucesso!');
                } catch (e) {
                  alert('Erro ao carregar folhas!');
                }
              }
            }}
          >
            Carregar todas as folhas na base de dados
          </button>
          <button
            className="export-excel-btn"
            onClick={() => {
              const wb = XLSX.utils.book_new();
              Object.entries(sheetsData).forEach(([sheetName, data]) => {
                const ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
              });
              XLSX.writeFile(wb, 'dados_editados.xlsx');
            }}
          >
            Guardar dados num Excel
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadData;
