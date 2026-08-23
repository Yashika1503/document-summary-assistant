import { useState, useRef } from 'react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export default function UploadZone({ onFileSelect, selectedFile }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function validateAndSelect(file) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onFileSelect(null, 'Please upload a PDF, JPG, or PNG file.');
      return;
    }
    onFileSelect(file, null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    validateAndSelect(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleFileInput(e) {
    validateAndSelect(e.target.files[0]);
  }

  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${selectedFile ? 'upload-zone--filled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileInput}
        className="upload-zone__input"
      />

      {selectedFile ? (
        <div className="upload-zone__file">
          <span className="upload-zone__filename">{selectedFile.name}</span>
          <span className="upload-zone__filesize">
            {(selectedFile.size / 1024).toFixed(0)} KB
          </span>
        </div>
      ) : (
        <div className="upload-zone__prompt">
          <p className="upload-zone__title">Drop a document here</p>
          <p className="upload-zone__subtitle">or click to browse — PDF, JPG, or PNG</p>
        </div>
      )}
    </div>
  );
}