const { createWorker } = require('tesseract.js');

const MIN_CONFIDENCE = 60;

async function extractTextFromImage(buffer) {
  const worker = await createWorker('eng');

  try {
    const { data } = await worker.recognize(buffer);
    const text = data.text.trim();

    if (!text || data.confidence < MIN_CONFIDENCE) {
      throw new Error('No readable text found in this image.');
    }

    return text;
  } finally {
    await worker.terminate();
  }
}

module.exports = extractTextFromImage;