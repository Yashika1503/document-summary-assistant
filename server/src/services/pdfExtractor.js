const { PDFParse } = require('pdf-parse');

async function extractTextFromPDF(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const text = result.text.trim();

    if (!text) {
      throw new Error('No extractable text found in this PDF. It may be a scanned document — try OCR instead.');
    }

    return text;
  } finally {
    await parser.destroy();
  }
}

module.exports = extractTextFromPDF;