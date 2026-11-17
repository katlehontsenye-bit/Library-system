import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  books: (
    <>
      <path d="M4 4h5v16H4z" /><path d="M11 4h5v16h-5z" /><path d="M18 6l3 .8-3.6 13.2-3-.8z" />
    </>
  ),
  transactions: <path d="M7 7h12l-3-3M17 17H5l3 3" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.5 3.2-5.5 6.5-5.5s5.9 2 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 010 6.8M18.5 14.8c1.7.7 2.8 2.4 3 5.2" />
    </>
  ),
  logout: <path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />,
};

function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="brand-name">Shelfwise</span>
      </div>

      <nav className="side-nav">
        <NavLink to="/dashboard"><Icon name="dashboard" />Dashboard</NavLink>
        {isAdmin && <NavLink to="/books"><Icon name="books" />Books</NavLink>}
        <NavLink to="/transactions"><Icon name="transactions" />Transactions</NavLink>
        <NavLink to="/users"><Icon name="users" />{isAdmin ? 'Users' : 'My account'}</NavLink>
      </nav>

      <div className="side-user">
        <Avatar name={user.name} />
        <div className="side-user-text">
          <strong>{user.name}</strong>
          <span>{user.role}</span>
        </div>
        <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
