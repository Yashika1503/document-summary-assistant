export default function SummaryResult({ result, onReset }) {
  const { filename, summary, keyPoints, warning } = result;

  return (
    <div className="summary-result">
      <div className="summary-result__meta">
        <span className="summary-result__filename">{filename}</span>
        <button className="summary-result__reset" onClick={onReset}>
          New document
        </button>
      </div>

      {warning && (
        <div className="summary-result__warning">{warning}</div>
      )}

      {summary && (
        <section className="summary-result__section">
          <h2>Summary</h2>
          <p>{summary}</p>
        </section>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <section className="summary-result__section">
          <h2>Key points</h2>
          <ul className="summary-result__keypoints">
            {keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}