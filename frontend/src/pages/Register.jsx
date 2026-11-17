import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Message from '../components/Message.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', membership_id: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = 'Full name is required';
    if (!form.membership_id.trim()) found.membership_id = 'Membership ID is required';
    if (form.password.length < 6) found.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match';
    return found;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await register(form.name.trim(), form.membership_id.trim(), form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card form login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-icon">✨</div>
        <h2 className="center">Create your account</h2>
        <p className="muted center">Join the library as a member</p>
        <Message>{serverError}</Message>

        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} autoFocus />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>

        <label>
          Membership ID
          <input name="membership_id" value={form.membership_id} onChange={handleChange} placeholder="e.g. m251234" />
          {errors.membership_id && <span className="field-error">{errors.membership_id}</span>}
        </label>

        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} autoComplete="new-password" />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
