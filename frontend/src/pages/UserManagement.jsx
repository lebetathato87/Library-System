import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import Message from '../components/Message.jsx';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadUsers() {
    try {
      setUsers(await api('/users'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSave(data) {
    if (userToEdit) {
      await api(`/users/${userToEdit.id}`, { method: 'PUT', body: data });
      setSuccess('User updated');
      setUserToEdit(null);
    } else {
      await api('/users', { method: 'POST', body: data });
      setSuccess('User added');
    }
    setError('');
    await loadUsers();
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    try {
      await api(`/users/${user.id}`, { method: 'DELETE' });
      if (userToEdit?.id === user.id) setUserToEdit(null);
      setSuccess('User deleted');
      setError('');
      await loadUsers();
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  }

  function handleEdit(user) {
    setUserToEdit(user);
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section>
      <h1>User Management</h1>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>

      <div className="two-col">
        <UserForm userToEdit={userToEdit} onSubmit={handleSave} onCancel={() => setUserToEdit(null)} />
        <div>
          <h2>All Users ({users.length})</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <UserList
              users={users}
              currentUserId={currentUser.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              editingId={userToEdit?.id}
            />
          )}
        </div>
      </div>
    </section>
  );
}
