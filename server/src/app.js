const express = require('express');
const cors = require('cors');
require('dotenv').config();
const upload = require('./middleware/upload');
const extractTextFromPDF = require('./services/pdfExtractor');

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

  try {
    if (req.file.mimetype === 'application/pdf') {
      const text = await extractTextFromPDF(req.file.buffer);
      return res.json({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        extractedText: text,
      });
    }

    return res.json({
      message: 'File received (OCR not yet implemented)',
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    return res.status(422).json({ error: err.message });
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