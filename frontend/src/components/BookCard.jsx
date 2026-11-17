/** Card layout for one book (used on the dashboard). Low stock is highlighted. */
export default function BookCard({ book }) {
  const low = book.quantity < 2;
  return (
    <div className={low ? 'card book-card low' : 'card book-card'}>
      <span className="tag">{book.genre}</span>
      <h3>{book.title}</h3>
      <p className="muted">by {book.author}</p>
      <p className="small">ISBN: {book.isbn}</p>
      <div className="book-card-footer">
        <span className={low ? 'badge badge-low' : 'badge badge-ok'}>
          {book.quantity} in stock
        </span>
        {low && <span className="low-text">{book.quantity === 0 ? 'Out of stock!' : 'Low stock!'}</span>}
      </div>
    </div>
  );
}
