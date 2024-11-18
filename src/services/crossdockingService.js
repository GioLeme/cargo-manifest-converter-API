const pdfParse = require('pdf-parse');

exports.parsePDF = (ULDFileBuffer) => {
  return pdfParse(ULDFileBuffer);
};

exports.crossdockingPriorities = (priorities, uldList) => uldList
  .map(uld => ({
    ...uld,
    priority: priorities.find(({ ULD }) => ULD === uld.ULD)?.priority || 'N/D',
  }))
  .sort((a, b) => a.priority - b.priority);


exports.extractManifestByULDData = (text) => {
  const result = [];
  let currentULD = null; // Armazena o ULD atual para associá-lo às próximas linhas

  const regexULD = /\b(BULK|[A-Z]{3}\d{5}[A-Z0-9]{2})\b/;
  const regexData = /(\d{3})-(\d{8})(\d{1,})(?:\/(\d+(,\d{3})?))?(?:\/(?:\d{1,3}|,\d{3}))?/;

  const lines = text.split('\n');

  for (const line of lines) {
    // Verifica se a linha contém um ULD (ex.: "PMC46830PO")
    const uldMatch = regexULD.exec(line.trim());

    if (uldMatch) {
      currentULD = uldMatch[0]; // Atualiza o ULD atual para as próximas linhas
      continue; // Continua para a próxima linha após detectar o ULD
    }

    const lineFormatted = line.replace(/\d,\d{3}\.\d{2}(?=[A-Za-z])/, '');

    // Verifica se a linha contém dados de AWB, quantidade e total de peças
    const dataMatch = regexData.exec(lineFormatted);

    if (dataMatch && currentULD) {
      const awb = dataMatch[1] + dataMatch[2]; // AWB concatenado sem hífen
      const quantity = dataMatch[3]; // Quantidade de peças
      const totalOfPieces = dataMatch[4] || dataMatch[3]; // Total de peças

      result.push({
        ULD: currentULD,
        AWB: awb,
        quantity: validateAndFormatQuantity(quantity),
        totalOfPieces: validateAndFormatQuantity(totalOfPieces),
      });
    }
  }

  return result;
};

function validateAndFormatQuantity(quantity) {
  // TODO: checar se o número está no formato correto.
  return quantity;
}