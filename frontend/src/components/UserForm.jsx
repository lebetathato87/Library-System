import { useEffect, useState } from 'react';
import Message from './Message.jsx';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

/** Controlled form for adding a new user or updating an existing one (admin only). */
export default function UserForm({ userToEdit, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const editing = Boolean(userToEdit);

  useEffect(() => {
    setForm(userToEdit ? { ...userToEdit, password: '' } : EMPTY);
    setErrors({});
    setServerError('');
  }, [userToEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = 'Name is required';
    if (!form.membership_id.trim()) found.membership_id = 'Membership ID is required';
    if (!editing && form.password.length < 6) found.password = 'Password must be at least 6 characters';
    if (editing && form.password && form.password.length < 6) found.password = 'New password must be at least 6 characters';
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
      await onSubmit(form);
      if (!editing) setForm(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Update User' : 'Add New User'}</h2>
      <Message>{serverError}</Message>

      <label>
        Full name
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <div className="form-row">
        <label>
          Membership ID
          <input name="membership_id" value={form.membership_id} onChange={handleChange} placeholder="e.g. MEM001" />
          {errors.membership_id && <span className="field-error">{errors.membership_id}</span>}
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      <label>
        {editing ? 'New password (leave blank to keep the current one)' : 'Password'}
        <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        {errors.password && <span className="field-error">{errors.password}</span>}
      </label>

      <div className="form-buttons">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add User'}
        </button>
        {editing && <button className="btn btn-light" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
