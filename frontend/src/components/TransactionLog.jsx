const LABELS = {
  ADD_STOCK: { text: 'Stock added', className: 'badge badge-ok' },
  BORROW: { text: 'Borrowed', className: 'badge badge-low' },
  RETURN: { text: 'Returned', className: 'badge badge-info' },
};

/** Transaction history table. Admins get a Delete button for each log entry. */
export default function TransactionLog({ transactions, onDelete }) {
  if (transactions.length === 0) return <p className="muted center">No transactions yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Book</th>
            <th>Type</th>
            <th>Qty</th>
            <th>User</th>
            <th>Note</th>
            {onDelete && <th></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const label = LABELS[t.type];
            return (
              <tr key={t.id}>
                <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
                <td data-label="Book"><strong>{t.book_title}</strong></td>
                <td data-label="Type"><span className={label.className}>{label.text}</span></td>
                <td data-label="Qty">{t.quantity}</td>
                <td data-label="User">{t.user_name || <span className="muted">(deleted user)</span>}</td>
                <td data-label="Note">{t.note || '—'}</td>
                {onDelete && (
                  <td className="actions">
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(t)}>Delete</button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
