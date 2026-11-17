import { useEffect, useState } from 'react';
import { api } from '../api.js';
import BookCard from '../components/BookCard.jsx';
import BookList from '../components/BookList.jsx';
import Message from '../components/Message.jsx';

const LOW_STOCK = 2; // fewer than 2 copies counts as "low"

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('cards');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/books')
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const term = search.trim().toLowerCase();
  const visible = books.filter((b) =>
    [b.title, b.author, b.genre, b.isbn].some((field) => field.toLowerCase().includes(term))
  );

  const totalCopies = books.reduce((sum, b) => sum + b.quantity, 0);
  const lowStock = books.filter((b) => b.quantity < LOW_STOCK);

  return (
    <section>
      <h1>Dashboard</h1>
      <Message>{error}</Message>

      <div className="stats">
        <div className="card stat"><span className="stat-number">{books.length}</span><span>Book titles</span></div>
        <div className="card stat"><span className="stat-number">{totalCopies}</span><span>Copies in stock</span></div>
        <div className="card stat stat-warn">
          <span className="stat-number">{lowStock.length}</span><span>Low-stock books</span>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="message message-warn">
          ⚠️ Low stock: {lowStock.map((b) => `${b.title} (${b.quantity})`).join(', ')}
        </div>
      )}

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search by title, author, genre or ISBN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toggle">
          <button className={view === 'cards' ? 'btn btn-sm' : 'btn btn-light btn-sm'} onClick={() => setView('cards')}>Cards</button>
          <button className={view === 'table' ? 'btn btn-sm' : 'btn btn-light btn-sm'} onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {loading ? (
        <p className="muted center">Loading books…</p>
      ) : view === 'cards' ? (
        visible.length === 0 ? (
          <p className="muted center">No books found.</p>
        ) : (
          <div className="grid">
            {visible.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )
      ) : (
        <BookList books={visible} />
      )}
    </section>
  );
}
