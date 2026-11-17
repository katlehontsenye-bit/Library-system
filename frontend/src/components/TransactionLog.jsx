const LABELS = { ADD_STOCK: 'Stock added', BORROW: 'Borrowed', RETURN: 'Returned' };

export default function TransactionLog({ transactions }) {
  if (transactions.length === 0) return <p className="muted">No transactions yet.</p>;

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>User</th></tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Type"><span className={`badge badge-${t.type.toLowerCase()}`}>{LABELS[t.type]}</span></td>
              <td data-label="Qty">{t.quantity}</td>
              <td data-label="User">{t.user_name ? `${t.user_name} (${t.membership_id})` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
