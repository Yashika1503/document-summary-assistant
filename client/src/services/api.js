const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function uploadDocument(file, length) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('length', length);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed. Please try again.');
  }

  return data;
}