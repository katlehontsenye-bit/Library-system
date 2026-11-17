import { useEffect, useState } from 'react';
import { api } from '../api.js';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import Message from '../components/Message.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function loadBooks() {
    try {
      setBooks(await api.get('/books'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function handleAdd(book) {
    await api.post('/books', book); // errors bubble up to the form
    await loadBooks();
  }

  async function handleUpdate(id, book) {
    await api.put(`/books/${id}`, book); // errors bubble up to the row
    await loadBooks();
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history will be removed too.`)) return;
    try {
      await api.del(`/books/${book.id}`);
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = books.filter((b) =>
    `${b.title} ${b.author} ${b.genre} ${b.isbn}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Books" subtitle="Add new titles and edit or remove existing ones." />
      <Message text={error} />
      <BookForm onSubmit={handleAdd} />

      <div className="list-head">
        <h2>All books ({books.length})</h2>
        <input
          type="search"
          className="search"
          placeholder="Search books"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search books"
        />
      </div>
      {loading ? <p className="muted">Loading...</p> : (
        <BookList books={visible} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </>
  );
}
