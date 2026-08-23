# Document Summary Assistant

A web app that extracts text from PDFs and scanned images, then generates an AI-powered summary with key points.

**Live app:** https://document-summary-assistant-blond.vercel.app/

**Backend API:** https://document-summary-assistant-r8r0.onrender.com

## My Approach

For this assessment I built a document summarizer with a React/Vite frontend and a Node/Express backend talking over a REST API. Users drop in a PDF or scanned image, and the backend pulls out the text — pdf-parse handles PDFs, and Tesseract.js does OCR for images. One thing I ran into early was OCR confidently "reading" text out of photos that had none at all, so I added a confidence-score check to filter that out rather than trusting any non-empty result.

The extracted text goes to the Gemini API with a prompt asking for structured JSON (a summary plus key points), and if the model doesn't return clean JSON, I fall back to showing the raw text instead of failing the request outright — I wanted the app to degrade gracefully rather than break on edge cases.

Given the 8-hour scope, I focused on making the core flow solid rather than adding extra features: proper error handling at every step, a partial-success state that keeps extracted text even if summarization fails, and a UI that's usable on mobile with both light and dark themes. Deployed the frontend on Vercel and backend on Render, with environment variables handling the API keys and endpoint config.

## Features

- Upload PDFs or scanned images (JPG/PNG) via drag-and-drop or file picker
- Text extraction: PDF parsing (`pdf-parse`) and OCR for images (`tesseract.js`)
- AI-generated summaries with adjustable length (short/medium/long) and key points, powered by the Gemini API
- Graceful error handling: invalid file types, unreadable scans, low-confidence OCR results, and AI API failures are all handled without crashing — including a partial-success state if extraction succeeds but summarization fails
- Dark/light theme toggle with persistence
- Mobile-responsive layout

## Tech stack

**Frontend:** React, Vite, plain CSS (custom properties for theming)
**Backend:** Node.js, Express
**File handling:** Multer (in-memory storage)
**PDF extraction:** pdf-parse
**OCR:** Tesseract.js
**AI:** Google Gemini API (gemini-3.6-flash)
**Deployment:** Vercel (frontend), Render (backend)

## Architecture

client/ React + Vite frontend
src/
components/ UploadZone, SummaryResult, ThemeToggle
services/ api.js — handles all backend requests
App.jsx

server/ Node + Express backend
src/
middleware/ upload.js — Multer config + file validation
services/ pdfExtractor.js, ocrExtractor.js, summarizer.js
app.js routes and server entry point


## How it works

1. User uploads a file via the browser
2. Backend validates file type/size (Multer)
3. Text is extracted — `pdf-parse` for PDFs, `tesseract.js` OCR for images (filtered by confidence score to avoid returning garbage on non-text images)
4. Extracted text is sent to the Gemini API with a prompt requesting structured JSON output (summary + key points)
5. Response is parsed and returned to the frontend; if JSON parsing fails, the raw AI text is returned as a fallback instead of erroring
6. Frontend displays the summary and key points, or a warning if only extraction succeeded

## Local setup

### Prerequisites
- Node.js 18+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Backend
```bash
cd server
npm install
```

Create `server/.env`:
GEMINI_API_KEY=your_key_here
PORT=5000


```bash
npm run dev
```

### Frontend
```bash
cd client
npm install
```

Create `client/.env`:
VITE_API_URL=http://localhost:5000


```bash
npm run dev
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `server/.env` | Auth for the Gemini API |
| `PORT` | `server/.env` | Backend port (defaults to 5000) |
| `VITE_API_URL` | `client/.env` | Backend URL the frontend calls |

## API overview

**`POST /api/upload`**
Multipart form data: `document` (file), `length` (`short`/`medium`/`long`, optional, defaults to `medium`)
Returns extracted text, summary, and key points in one call.

**`POST /api/summarize`**
JSON body: `{ text, length }`
Re-generates a summary for already-extracted text (used to change summary length without re-uploading).

**`GET /api/health`**
Health check.

## Deployment

- **Backend**: deployed to Render as a Node web service. Free tier — the service spins down after inactivity and takes ~30-50s to wake on the next request.
- **Frontend**: deployed to Vercel as a static Vite build. `VITE_API_URL` is set as a Vercel environment variable and baked in at build time.
- CORS on the backend allows the production Vercel domain and any preview deployment URL for this project.

## Limitations

- 10MB file size limit
- OCR accuracy depends on scan quality; low-confidence results are rejected rather than returned as garbled text
- Summarized text is capped at ~15,000 characters per request to stay within reasonable API usage
- Free-tier hosting means a cold-start delay on the first request after inactivity
- No user accounts or history — each session is stateless

## Future improvements

- Support multi-page PDF preview before summarizing
- Allow multiple language OCR (currently English only)
- Add a small automated test suite
- Move the AI model name to an environment variable to simplify future migrations
