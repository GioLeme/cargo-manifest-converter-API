const pdfParse = require('pdf-parse');

exports.parsePDF = (dataBuffer) => {
  return pdfParse(dataBuffer);
};

exports.extractManifestData = (text) => {
  const textWithoutSpace = text.replace(/\s+/g, '');
  const regex = /(\d{3})-(\d{8})(\d{1,})(?:\/(\d+))?/g;

  return Array.from(textWithoutSpace.matchAll(regex)).map(match => {
    const [, prefix, awbNumber, pieces, total] = match;
    return { 'AIR WAYBILL': `${prefix}${awbNumber}`, 'PIECES ARRIVED': pieces, 'PARTIAL SHIPMENT': total };
  });
};
