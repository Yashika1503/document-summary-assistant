const express = require('express');
const cors = require('cors');
require('dotenv').config();
const upload = require('./middleware/upload');
const extractTextFromPDF = require('./services/pdfExtractor');
const extractTextFromImage = require('./services/ocrExtractor');
const generateSummary = require('./services/summarizer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const length = req.body.length || 'medium';

  try {
    let text;

    if (req.file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(req.file.buffer);
    } else {
      text = await extractTextFromImage(req.file.buffer);
    }

    let summaryResult;
    try {
      summaryResult = await generateSummary(text, length);
    } catch (summaryErr) {
      console.error('Summarization error:', summaryErr.message);
      // Extraction succeeded even though summarization failed —
      // return the text so the user isn't left with nothing.
      return res.status(207).json({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        extractedText: text,
        summary: null,
        keyPoints: [],
        warning: 'Text was extracted, but AI summarization failed. You can try again.',
      });
    }

    return res.json({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      extractedText: text,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
    });
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

app.post('/api/summarize', express.json(), async (req, res) => {
  const { text, length } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'No text provided to summarize.' });
  }

  try {
    const result = await generateSummary(text, length);
    return res.json(result);
  } catch (err) {
    console.error('Summarization error:', err.message);
    return res.status(502).json({ error: 'AI summarization failed. Please try again.' });
  }
});

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});