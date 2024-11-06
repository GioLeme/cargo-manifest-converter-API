const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');


const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.send('welcome');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const dataBuffer = req.file.buffer;

  try {
    // Parse PDF content
    const data = await pdfParse(dataBuffer);
    const extractedData = extractManifestData(data.text);

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manifest');

    worksheet.columns = [
      { header: 'AIR WAYBILL', key: 'AIR WAYBILL', width: 30 },
      { header: 'PIECES ARRIVED', key: 'PIECES ARRIVED', width: 15 },
      { header: 'PARTIAL SHIPMENT', key: 'PARTIAL SHIPMENT', width: 20 },
    ];

    worksheet.addRows(extractedData);

    // Write the workbook to a buffer instead of a file
    const buffer = await workbook.xlsx.writeBuffer();

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=manifest.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Return the buffer as a download response
    res.end(buffer);

  } catch (error) {
    console.error('Error processing the PDF', error);
    res.status(500).send('Error processing the PDF');
  }
});

const extractManifestData = (text) => {
  const textWithoutSpace = text.replace(/\s+/g, '');
  const regex = /(\d{3})-(\d{8})(\d{1,})(?:\/(\d+))?/g;

  const handledData = Array.from(textWithoutSpace.matchAll(regex)).map(match => {
    const [, prefix, awbNumber, pieces, total] = match;
    return { 'AIR WAYBILL': `${prefix}${awbNumber}`, 'PIECES ARRIVED': pieces, 'PARTIAL SHIPMENT': total }
  });

  return handledData

};

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});