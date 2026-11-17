import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Message from './Message.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) {
      setError('Enter your membership ID and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.membership_id, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-grid login-card" onSubmit={handleSubmit} noValidate>
      <h2>Welcome back</h2>
      <p className="muted form-intro">Log in with your membership ID and password.</p>
      <label className="field">
        <span>Membership ID</span>
        <input name="membership_id" value={form.membership_id} onChange={handleChange} autoComplete="username" />
      </label>
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
      </label>
      <Message text={error} />
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
    </form>
  );
}
