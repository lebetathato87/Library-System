/** Table of books. When onEdit/onDelete are supplied, Update and Delete buttons are shown. */
export default function BookList({ books, onEdit, onDelete, editingId }) {
  if (books.length === 0) return <p className="muted center">No books found.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Qty</th>
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className={book.id === editingId ? 'row-editing' : ''}>
              <td data-label="Title"><strong>{book.title}</strong></td>
              <td data-label="Author">{book.author}</td>
              <td data-label="Genre"><span className="tag">{book.genre}</span></td>
              <td data-label="ISBN">{book.isbn}</td>
              <td data-label="Qty">
                <span className={book.quantity < 2 ? 'badge badge-low' : 'badge badge-ok'}>
                  {book.quantity}
                </span>
              </td>
              {(onEdit || onDelete) && (
                <td data-label="Actions" className="actions">
                  {onEdit && <button className="btn btn-sm" onClick={() => onEdit(book)}>Update</button>}
                  {onDelete && (
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(book)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
