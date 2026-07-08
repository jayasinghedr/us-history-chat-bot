export default function HistoryGallery({ title, tagline }) {
  return (
    <div className="header-brand">
      <img
        src="/images/declaration.jpg"
        alt="Declaration of Independence by John Trumbull"
        className="history-thumb"
      />
      <div className="header-titles">
        <h1>{title}</h1>
        {tagline && <p className="app-tagline">{tagline}</p>}
      </div>
      <img
        src="/images/lincoln.jpg"
        alt="Abraham Lincoln portrait"
        className="history-thumb"
      />
    </div>
  );
}
