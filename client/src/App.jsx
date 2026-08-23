import { useState } from 'react';
import UploadZone from './components/UploadZone';
import { uploadDocument } from './services/api';
import SummaryResult from './components/SummaryResult';
import './App.css';

export default function App() {
  const [file, setFile] = useState(null);
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  function handleFileSelect(selectedFile, errorMsg) {
    setError(errorMsg);
    setFile(selectedFile);
    setResult(null);
  }

  async function handleSummarize() {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const data = await uploadDocument(file, length);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
  setFile(null);
  setResult(null);
  setError(null);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Document Summary Assistant</h1>
        <p>Upload a PDF or scanned image to get an instant summary.</p>
      </header>

      {!result && (
        <>
          <UploadZone onFileSelect={handleFileSelect} selectedFile={file} />

          {error && <div className="app__error">{error}</div>}

          <div className="app__controls">
            <label htmlFor="length-select">Summary length</label>
            <select
              id="length-select"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>

            <button
              onClick={handleSummarize}
              disabled={!file || loading}
              className="app__submit"
            >
              {loading ? 'Summarizing…' : 'Summarize'}
            </button>
          </div>
        </>
      )}

      {result && (
        <SummaryResult result={result} onReset={handleReset} />
      )}
    </div>
  );
}