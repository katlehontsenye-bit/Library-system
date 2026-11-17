import { useEffect, useState } from 'react';
import Message from './Message.jsx';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

// Used for both adding a user and editing one (when `editingUser` is provided).
export default function UserForm({ editingUser, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Load the selected user into the form when "Update" is clicked
  useEffect(() => {
    setForm(editingUser ? { ...editingUser, password: '' } : EMPTY);
    setErrors({});
    setServerError('');
  }, [editingUser]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = 'Name is required';
    if (!form.membership_id.trim()) found.membership_id = 'Membership ID is required';
    // Password is required for new users, optional when editing
    if (!editingUser && form.password.length < 6) found.password = 'Password must be at least 6 characters';
    if (editingUser && form.password && form.password.length < 6) found.password = 'Password must be at least 6 characters';
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    try {
      await onSubmit(form);
      setForm(EMPTY);
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit} noValidate>
      <h2>{editingUser ? 'Update user' : 'Add a new user'}</h2>

      <label className="field">
        <span>Name</span>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <small className="field-error">{errors.name}</small>}
      </label>

      <label className="field">
        <span>Membership ID</span>
        <input name="membership_id" value={form.membership_id} onChange={handleChange} />
        {errors.membership_id && <small className="field-error">{errors.membership_id}</small>}
      </label>

      <label className="field">
        <span>Role</span>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label className="field">
        <span>{editingUser ? 'New password (leave blank to keep)' : 'Password'}</span>
        <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        {errors.password && <small className="field-error">{errors.password}</small>}
      </label>

      <Message text={serverError} />
      <div className="button-row">
        <button className="btn btn-primary">{editingUser ? 'Save changes' : 'Add user'}</button>
        {editingUser && <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
