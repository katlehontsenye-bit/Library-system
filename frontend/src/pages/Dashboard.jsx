import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LOW_STOCK_LIMIT } from '../utils.js';
import BookCard from '../components/BookCard.jsx';
import ShelfView from '../components/ShelfView.jsx';
import Message from '../components/Message.jsx';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');

  useEffect(() => {
    api.get('/books')
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const lowStock = books.filter((b) => b.quantity < LOW_STOCK_LIMIT);
  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);
  const genres = useMemo(() => ['All', ...new Set(books.map((b) => b.genre))], [books]);

  const visible = books.filter((b) => {
    const text = `${b.title} ${b.author} ${b.isbn}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (genre === 'All' || b.genre === genre);
  });

  const firstName = user.name.split(' ')[0];
  const summary = lowStock.length === 0
    ? `${books.length} titles and ${totalCopies} copies on the shelf, all well stocked.`
    : `${books.length} titles and ${totalCopies} copies on the shelf. ${lowStock.length} ${lowStock.length === 1 ? 'is' : 'are'} running low.`;

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>{greeting()}, {firstName}.</h1>
          {!loading && <p>{summary}</p>}
        </div>
        {!loading && <ShelfView books={books} />}
      </section>

      <Message text={error} />

      {loading ? (
        <p className="muted">Loading books...</p>
      ) : (
        <section className="catalogue">
          <div className="toolbar">
            <input
              type="search"
              className="search"
              placeholder="Search by title, author or ISBN"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
            <div className="chips">
              {genres.map((g) => (
                <button
                  key={g}
                  className={`chip ${genre === g ? 'chip-on' : ''}`}
                  aria-pressed={genre === g}
                  onClick={() => setGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="muted">No books match your search. Try a different word or genre.</p>
          ) : (
            <div className="grid">
              {visible.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          )}
        </section>
      )}
    </>
  );
}
