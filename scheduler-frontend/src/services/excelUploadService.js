import api from './api';

const excelUploadService = {
  upload: (sheetsData) => api.post('/ApiExcelUpload/Upload', sheetsData)
};

export default excelUploadService;