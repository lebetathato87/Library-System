import { useEffect, useState } from 'react';
import Message from './Message.jsx';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

/** Controlled form used for both adding a new book and updating an existing one. */
export default function AddBookForm({ bookToEdit, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const editing = Boolean(bookToEdit);

  // Fill the form when the user clicks "Update" on a book, clear it otherwise
  useEffect(() => {
    setForm(bookToEdit ? { ...bookToEdit, quantity: String(bookToEdit.quantity) } : EMPTY);
    setErrors({});
    setServerError('');
  }, [bookToEdit]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const found = {};
    if (!form.title.trim()) found.title = 'Title is required';
    if (!form.author.trim()) found.author = 'Author is required';
    if (!form.genre.trim()) found.genre = 'Genre is required';
    if (!/^\d{10}(\d{3})?$/.test(form.isbn.replace(/-/g, ''))) found.isbn = 'ISBN must have 10 or 13 digits';
    if (!/^\d+$/.test(form.quantity)) found.quantity = 'Enter a whole number (0 or more)';
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
      await onSubmit({ ...form, quantity: Number(form.quantity) });
      if (!editing) setForm(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>{editing ? 'Update Book' : 'Add New Book'}</h2>
      <Message>{serverError}</Message>

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Things Fall Apart" />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <label>
        Author
        <input name="author" value={form.author} onChange={handleChange} placeholder="e.g. Chinua Achebe" />
        {errors.author && <span className="field-error">{errors.author}</span>}
      </label>

      <div className="form-row">
        <label>
          Genre
          <input name="genre" value={form.genre} onChange={handleChange} placeholder="e.g. Fiction" />
          {errors.genre && <span className="field-error">{errors.genre}</span>}
        </label>
        <label>
          {editing ? 'Quantity' : 'Initial Quantity'}
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
          {errors.quantity && <span className="field-error">{errors.quantity}</span>}
        </label>
      </div>

      <label>
        ISBN
        <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="10 or 13 digits" />
        {errors.isbn && <span className="field-error">{errors.isbn}</span>}
      </label>

      <div className="form-buttons">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Book'}
        </button>
        {editing && (
          <button className="btn btn-light" type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
