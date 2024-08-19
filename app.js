const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');


const app = express();
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  let dataBuffer = fs.readFileSync(filePath);

  try {
    let data = await pdfParse(dataBuffer);
    let extractedData = extractManifestData(data.text);

    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Manifest');

    worksheet.columns = [
      { header: 'AIR WAYBILL', key: 'AIR WAYBILL', width: 30 },
      { header: 'PIECES ARRIVED', key: 'PIECES ARRIVED', width: 15 },
      { header: 'PARTIAL SHIPMENT', key: 'PARTIAL SHIPMENT', width: 20 },
    ];

    worksheet.addRows(extractedData);

    const fileName = 'manifest.xlsx';
    const filePath = path.join(__dirname, fileName);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading the file', err);
      }
      fs.unlinkSync(filePath);
      fs.unlinkSync(req.file.path);
    });
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

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
