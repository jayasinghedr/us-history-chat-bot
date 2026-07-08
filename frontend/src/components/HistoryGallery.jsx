export default function HistoryGallery() {
  const images = [
    {
      src: "/images/declaration.jpg",
      alt: "Declaration of Independence by John Trumbull",
    },
    {
      src: "/images/lincoln.jpg",
      alt: "Abraham Lincoln portrait",
    },
  ];

  return (
    <div className="history-gallery" aria-hidden="true">
      {images.map((image) => (
        <img key={image.src} src={image.src} alt={image.alt} className="history-thumb" />
      ))}
    </div>
  );
}
