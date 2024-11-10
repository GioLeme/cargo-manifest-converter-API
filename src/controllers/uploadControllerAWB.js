const pdfService = require('../services/pdfService');
const ExcelJS = require('exceljs');

exports.uploadFile = async (req, res) => {
  const dataBuffer = req.file.buffer;

  try {
    const data = await pdfService.parsePDF(dataBuffer);
    const extractedData = pdfService.extractManifestData(data.text);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manifest');

    worksheet.columns = [
      { header: 'AIR WAYBILL', key: 'AIR WAYBILL', width: 30 },
      { header: 'PIECES ARRIVED', key: 'PIECES ARRIVED', width: 15 },
      { header: 'PARTIAL SHIPMENT', key: 'PARTIAL SHIPMENT', width: 20 },
    ];

    worksheet.addRows(extractedData);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Disposition', 'attachment; filename=manifest.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(buffer);

  } catch (error) {
    console.error('Erro ao processar o PDF:', error);
    res.status(500).send('Erro ao processar o PDF');
  }
};
