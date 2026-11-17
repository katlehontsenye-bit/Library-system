import { useState } from 'react';
import Message from './Message.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Form to add stock, borrow, or return books.
export default function TransactionForm({ books, users, onSubmit }) {
  const { user, isAdmin } = useAuth();
  const [form, setForm] = useState({ book_id: '', type: isAdmin ? 'ADD_STOCK' : 'BORROW', quantity: 1, user_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const needsUser = form.type !== 'ADD_STOCK';

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.book_id) return setError('Please choose a book');
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 1) {
      return setError('Quantity must be a whole number of 1 or more');
    }
    // Admins pick the member; members always act as themselves.
    const userId = isAdmin ? form.user_id : user.id;
    if (needsUser && !userId) return setError('Please choose the user');

    setSaving(true);
    try {
      await onSubmit({
        book_id: Number(form.book_id),
        type: form.type,
        quantity: Number(form.quantity),
        user_id: needsUser ? Number(userId) : user.id,
      });
      setSuccess('Transaction recorded');
      setForm((prev) => ({ ...prev, quantity: 1 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit} noValidate>
      <h2>Record a transaction</h2>

      <label className="field">
        <span>Book</span>
        <select name="book_id" value={form.book_id} onChange={handleChange}>
          <option value="">Select a book...</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.title} ({b.quantity} in stock)</option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Action</span>
        <select name="type" value={form.type} onChange={handleChange}>
          {isAdmin && <option value="ADD_STOCK">Add stock (new books arrived)</option>}
          <option value="BORROW">Borrow (deduct stock)</option>
          <option value="RETURN">Return (add back)</option>
        </select>
      </label>

      {needsUser && isAdmin && (
        <label className="field">
          <span>User</span>
          <select name="user_id" value={form.user_id} onChange={handleChange}>
            <option value="">Select a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.membership_id})</option>
            ))}
          </select>
        </label>
      )}

      <label className="field">
        <span>Quantity</span>
        <input type="number" name="quantity" min="1" value={form.quantity} onChange={handleChange} />
      </label>

      <Message text={error} />
      <Message type="success" text={success} />
      <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</button>
    </form>
  );
}
