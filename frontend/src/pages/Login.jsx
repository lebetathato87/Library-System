import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Message from '../components/Message.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.membership_id.trim() || !form.password) {
      return setError('Please enter your membership ID and password');
    }
    setError('');
    setLoading(true);
    try {
      await login(form.membership_id.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="card form login-card" onSubmit={handleSubmit} noValidate>
        <div className="login-icon">📖</div>
        <h2 className="center">Welcome back</h2>
        <p className="muted center">Log in to manage the library</p>
        <Message>{error}</Message>

        <label>
          Membership ID
          <input name="membership_id" value={form.membership_id} onChange={handleChange} autoFocus />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <div className="divider"><span>New here?</span></div>

        <button className="btn btn-light" type="button" onClick={() => navigate('/register')}>
          Create New Account
        </button>
      </form>
    </div>
  );
}
