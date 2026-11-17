import { useEffect, useState } from 'react';
import { api } from '../api.js';
import AddBookForm from '../components/AddBookForm.jsx';
import BookList from '../components/BookList.jsx';
import Message from '../components/Message.jsx';

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [bookToEdit, setBookToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadBooks() {
    try {
      setBooks(await api('/books'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  // Called by the form: creates or updates depending on whether a book is being edited
  async function handleSave(data) {
    if (bookToEdit) {
      await api(`/books/${bookToEdit.id}`, { method: 'PUT', body: data });
      setSuccess('Book updated');
      setBookToEdit(null);
    } else {
      await api('/books', { method: 'POST', body: data });
      setSuccess('Book added');
    }
    setError('');
    await loadBooks();
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history will be removed too.`)) return;
    try {
      await api(`/books/${book.id}`, { method: 'DELETE' });
      if (bookToEdit?.id === book.id) setBookToEdit(null);
      setSuccess('Book deleted');
      setError('');
      await loadBooks();
    } catch (err) {
      setSuccess('');
      setError(err.message);
    }
  }

  function handleEdit(book) {
    setBookToEdit(book);
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section>
      <h1>Book Management</h1>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>

      <div className="two-col">
        <AddBookForm bookToEdit={bookToEdit} onSubmit={handleSave} onCancel={() => setBookToEdit(null)} />
        <div>
          <h2>All Books ({books.length})</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <BookList books={books} onEdit={handleEdit} onDelete={handleDelete} editingId={bookToEdit?.id} />
          )}
        </div>
      </div>
    </section>
  );
}
