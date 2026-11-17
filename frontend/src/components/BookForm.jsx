import { useState } from 'react';
import Message from './Message.jsx';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: 0 };

// Controlled form for adding a book. Validates before calling onSubmit.
export default function BookForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const found = {};
    if (!form.title.trim()) found.title = 'Title is required';
    if (!form.author.trim()) found.author = 'Author is required';
    if (!form.genre.trim()) found.genre = 'Genre is required';
    if (!/^[0-9-]{10,17}$/.test(form.isbn.trim())) found.isbn = 'ISBN must be 10-17 digits (hyphens allowed)';
    if (form.quantity === '' || Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity))) {
      found.quantity = 'Quantity must be a whole number, 0 or more';
    }
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({ ...form, quantity: Number(form.quantity) });
      setForm(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const field = (name, label, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      <input type={type} name={name} value={form[name]} onChange={handleChange} min={type === 'number' ? 0 : undefined} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="card form-grid" onSubmit={handleSubmit} noValidate>
      <h2>Add a new book</h2>
      {field('title', 'Title')}
      {field('author', 'Author')}
      {field('genre', 'Genre')}
      {field('isbn', 'ISBN')}
      {field('quantity', 'Initial quantity', 'number')}
      <Message text={serverError} />
      <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add book'}</button>
    </form>
  );
}
