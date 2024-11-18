const crossdockingService = require('../services/crossdockingService');
const ExcelJS = require('exceljs');


exports.generatePriorities = async (req, res) => {
  const ULDFileBuffer = req.file.buffer;
  const prioritiesData = JSON.parse(req.body.priorities);

  try {
    const ULDManifestPDF = await crossdockingService.parsePDF(ULDFileBuffer);
    const extractedULDData = crossdockingService.extractManifestByULDData(ULDManifestPDF.text);
    const ULDWithPriority = await crossdockingService.crossdockingPriorities(prioritiesData, extractedULDData);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CrossDocking');

    worksheet.columns = [
      { header: 'TRUCK NAME', width: 15 },
      { header: 'PRIO', key: 'priority', width: 5 },
      { header: 'ULD', key: 'ULD', width: 15 },
      { header: 'AIR WAYBILL', key: 'AWB', width: 15 },
      { header: 'PIECES ARRIVED', key: 'quantity', width: 15 },
      { header: 'PARTIAL SHIPMENT', key: 'totalOfPieces', width: 15 },
    ];

    worksheet.addRows(ULDWithPriority);

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Disposition', 'attachment; filename=CrossDocking.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(buffer);

    return ULDWithPriority;
  } catch (error) {
    console.error('Erro ao processar o PDF:', error);
    res.status(500).send('Erro ao processar o PDF');
  }
}