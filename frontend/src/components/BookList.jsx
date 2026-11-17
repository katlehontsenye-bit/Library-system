import { useState } from 'react';
import { LOW_STOCK_LIMIT } from '../utils.js';

// One table row that can switch into edit mode.
function BookRow({ book, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(book);
  const [error, setError] = useState('');

  function handleChange(e) {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.author.trim() || !draft.genre.trim() || !draft.isbn.trim()) {
      setError('All fields are required');
      return;
    }
    try {
      await onUpdate(book.id, draft);
      setEditing(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    setDraft(book);
    setEditing(false);
    setError('');
  }

  if (editing) {
    return (
      <tr>
        {['title', 'author', 'genre', 'isbn'].map((name) => (
          <td key={name} data-label={name}>
            <input name={name} value={draft[name]} onChange={handleChange} />
          </td>
        ))}
        <td data-label="Stock">{book.quantity}</td>
        <td className="actions">
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn btn-light" onClick={handleCancel}>Cancel</button>
          {error && <small className="field-error">{error}</small>}
        </td>
      </tr>
    );
  }

  return (
    <tr className={book.quantity < LOW_STOCK_LIMIT ? 'row-low' : ''}>
      <td data-label="Title">{book.title}</td>
      <td data-label="Author">{book.author}</td>
      <td data-label="Genre">{book.genre}</td>
      <td data-label="ISBN">{book.isbn}</td>
      <td data-label="Stock">{book.quantity}</td>
      <td className="actions">
        <button className="btn btn-primary" onClick={() => setEditing(true)}>Update</button>
        <button className="btn btn-danger" onClick={() => onDelete(book)}>Delete</button>
      </td>
    </tr>
  );
}

export default function BookList({ books, onUpdate, onDelete }) {
  if (books.length === 0) return <p className="muted">No books yet. Add one above.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <BookRow key={book.id} book={book} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
