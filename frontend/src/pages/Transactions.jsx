import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StockForm from '../components/StockForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';
import Message from '../components/Message.jsx';

export default function Transactions() {
  const { isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [bookData, txData] = await Promise.all([api('/books'), api('/transactions')]);
      setBooks(bookData);
      setTransactions(txData);
      if (isAdmin) setUsers(await api('/users'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRecord(data) {
    await api('/transactions', { method: 'POST', body: data });
    await loadData(); // refresh stock numbers and the history log
  }

  async function handleDelete(t) {
    if (!window.confirm('Delete this log entry? Stock levels will NOT change.')) return;
    try {
      await api(`/transactions/${t.id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Transactions</h1>
      <Message>{error}</Message>

      <div className="two-col">
        <StockForm books={books} users={users} onSubmit={handleRecord} />
        <div>
          <h2>{isAdmin ? 'Transaction History' : 'My Borrowing History'}</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <TransactionLog transactions={transactions} onDelete={isAdmin ? handleDelete : undefined} />
          )}
        </div>
      </div>
    </section>
  );
}
