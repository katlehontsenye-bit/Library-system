import { genreColor, LOW_STOCK_LIMIT } from '../utils.js';

// A row of book spines: taller = more copies in stock, colour = genre.
export default function ShelfView({ books }) {
  if (books.length === 0) return <p className="shelf-empty">The shelf is empty. Add your first book on the Books page.</p>;

  return (
    <div className="shelf" role="list" aria-label="Shelf view of all books">
      {books.map((book, n) => {
        const low = book.quantity < LOW_STOCK_LIMIT;
        const height = 96 + Math.min(book.quantity, 10) * 11;
        return (
          <div
            key={book.id}
            role="listitem"
            className={`spine ${book.quantity === 0 ? 'spine-empty' : ''}`}
            style={{ height, background: genreColor(book.genre), '--n': n }}
            title={`${book.title} - ${book.quantity} in stock`}
          >
            {low && <span className="spine-flag" aria-label="Low stock" />}
            <span className="spine-title">{book.title}</span>
          </div>
        );
      })}
    </div>
  );
}
