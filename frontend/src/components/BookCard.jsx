import { genreColor, LOW_STOCK_LIMIT } from '../utils.js';

export default function BookCard({ book }) {
  const out = book.quantity === 0;
  const low = book.quantity < LOW_STOCK_LIMIT;

  return (
    <article
      className={`book-card ${low ? 'is-low' : ''}`}
      style={{ '--spine': genreColor(book.genre) }}
    >
      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <p className="book-meta">
          <span className="tag" style={{ background: genreColor(book.genre) }}>{book.genre}</span>
          <span className="isbn">ISBN {book.isbn}</span>
        </p>
      </div>
      <div className="book-stock">
        <strong>{book.quantity}</strong>
        <span>{book.quantity === 1 ? 'copy' : 'copies'}</span>
        {low && <span className="badge badge-warn">{out ? 'Out of stock' : 'Low stock'}</span>}
      </div>
    </article>
  );
}
