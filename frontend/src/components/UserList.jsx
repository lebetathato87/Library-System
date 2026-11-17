export default function UserList({ users, currentUserId, onEdit, onDelete, editingId }) {
  if (users.length === 0) return <p className="muted center">No users yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className={u.id === editingId ? 'row-editing' : ''}>
              <td data-label="Name"><strong>{u.name}</strong></td>
              <td data-label="Membership ID">{u.membership_id}</td>
              <td data-label="Role">
                <span className={u.role === 'admin' ? 'badge badge-info' : 'tag'}>{u.role}</span>
              </td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-sm" onClick={() => onEdit(u)}>Update</button>
                {u.id !== currentUserId && (
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(u)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
