import Avatar from './Avatar.jsx';

export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (users.length === 0) return <p className="muted">No users yet. Add the first one with the form.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="Name">
                <span className="user-cell"><Avatar name={u.name} size={32} />{u.name}</span>
              </td>
              <td data-label="Membership ID">{u.membership_id}</td>
              <td data-label="Role"><span className={`badge badge-${u.role}`}>{u.role}</span></td>
              <td className="actions">
                <button className="btn btn-primary" onClick={() => onEdit(u)}>Update</button>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(u)}
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? 'You cannot delete your own account' : ''}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
