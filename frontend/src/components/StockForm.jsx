import { useState } from 'react';
import Message from './Message.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Form for adding stock, borrowing and returning books. */
export default function StockForm({ books, users, onSubmit }) {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ book_id: '', type: 'BORROW', quantity: '1', user_id: '', note: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.book_id) return setError('Please choose a book');
    if (!/^[1-9]\d*$/.test(form.quantity)) return setError('Quantity must be a whole number of 1 or more');

    setSaving(true);
    try {
      await onSubmit({
        book_id: Number(form.book_id),
        type: form.type,
        quantity: Number(form.quantity),
        user_id: form.user_id ? Number(form.user_id) : undefined,
        note: form.note.trim() || undefined,
      });
      setSuccess('Transaction recorded successfully!');
      setForm({ ...form, quantity: '1', note: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>New Transaction</h2>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>

      <div className="type-buttons" role="group" aria-label="Transaction type">
        {isAdmin && (
          <button
            type="button"
            className={form.type === 'ADD_STOCK' ? 'btn' : 'btn btn-light'}
            onClick={() => setForm({ ...form, type: 'ADD_STOCK' })}
          >
            ＋ Add Stock
          </button>
        )}
        <button
          type="button"
          className={form.type === 'BORROW' ? 'btn' : 'btn btn-light'}
          onClick={() => setForm({ ...form, type: 'BORROW' })}
        >
          − Borrow
        </button>
        <button
          type="button"
          className={form.type === 'RETURN' ? 'btn' : 'btn btn-light'}
          onClick={() => setForm({ ...form, type: 'RETURN' })}
        >
          ↩ Return
        </button>
      </div>

      <label>
        Book
        <select name="book_id" value={form.book_id} onChange={handleChange}>
          <option value="">— Select a book —</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.quantity} in stock)
            </option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label>
          Quantity
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} />
        </label>

        {isAdmin && form.type !== 'ADD_STOCK' && (
          <label>
            Member
            <select name="user_id" value={form.user_id} onChange={handleChange}>
              <option value="">Myself</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.membership_id})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label>
        Note (optional)
        <input name="note" value={form.note} onChange={handleChange} maxLength={255} />
      </label>

      <button className="btn" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Record Transaction'}
      </button>
    </form>
  );
}
