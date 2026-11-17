import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import Message from '../components/Message.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Avatar from '../components/Avatar.jsx';

// Decorative spines for the login screen: [height, colour]
const ART_SPINES = [
  [150, '#5B4BD6'], [210, '#FFB627'], [120, '#0E8F80'], [250, '#E0405A'], [180, '#2F6FDB'],
  [230, '#C77700'], [140, '#C026A5'], [200, '#5B4BD6'], [270, '#0E8F80'], [160, '#FFB627'],
  [220, '#E0405A'], [130, '#2F6FDB'],
];

function LoginScreen() {
  return (
    <div className="auth">
      <div className="auth-art">
        <div className="auth-copy">
          <span className="brand-name">Shelfwise</span>
          <h1>Every book, accounted for.</h1>
          <p>Track stock, lend books and keep a clear record of who has what.</p>
        </div>
        <div className="auth-shelf" aria-hidden="true">
          {ART_SPINES.map(([height, color], i) => (
            <span key={i} style={{ height, background: color }} />
          ))}
        </div>
      </div>
      <div className="auth-panel">
        <LoginForm />
      </div>
    </div>
  );
}

// Not logged in -> login screen. Admin -> user management. Member -> account summary.
export default function Users() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      setUsers(await api.get('/users'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  async function handleSubmit(form) {
    if (editingUser) {
      await api.put(`/users/${editingUser.id}`, form);
      setEditingUser(null);
    } else {
      await api.post('/users', form);
    }
    await loadUsers();
  }

  async function handleDelete(target) {
    if (!window.confirm(`Delete user ${target.name}?`)) return;
    try {
      await api.del(`/users/${target.id}`);
      if (editingUser?.id === target.id) setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user) return <LoginScreen />;

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="My account" />
        <div className="card account-card">
          <Avatar name={user.name} size={64} />
          <div>
            <h2>{user.name}</h2>
            <p className="muted">Membership ID {user.membership_id}</p>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Add members, change their details or remove them." />
      <Message text={error} />
      <div className="split split-users">
        <UserForm editingUser={editingUser} onSubmit={handleSubmit} onCancel={() => setEditingUser(null)} />
        <div>
          <h2 className="first-h2">All users ({users.length})</h2>
          <UserList users={users} currentUserId={user.id} onEdit={setEditingUser} onDelete={handleDelete} />
        </div>
      </div>
    </>
  );
}
