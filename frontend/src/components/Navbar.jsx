import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/login');
  }

  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">📚 Pink Library</span>

        {user && (
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            ☰
          </button>
        )}

        {user && (
          <nav className={open ? 'nav open' : 'nav'}>
            <NavLink to="/" end className={link} onClick={close}>Dashboard</NavLink>
            {isAdmin && <NavLink to="/books" className={link} onClick={close}>Books</NavLink>}
            <NavLink to="/transactions" className={link} onClick={close}>Transactions</NavLink>
            {isAdmin && <NavLink to="/users" className={link} onClick={close}>Users</NavLink>}
            <span className="nav-user">
              {user.name} <em>({user.role})</em>
            </span>
            <button className="btn btn-light btn-sm" onClick={handleLogout}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  );
}
