import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionLog from '../components/TransactionLog.jsx';
import Message from '../components/Message.jsx';
import PageHeader from '../components/PageHeader.jsx';

export default function Transactions() {
  const { user, isAdmin } = useAuth();
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  async function loadAll() {
    try {
      // Members only see their own history; admins see everything.
      const historyPath = isAdmin ? '/transactions' : `/transactions?user_id=${user.id}`;
      const [b, t, u] = await Promise.all([
        api.get('/books'),
        api.get(historyPath),
        isAdmin ? api.get('/users') : Promise.resolve([]),
      ]);
      setBooks(b);
      setTransactions(t);
      setUsers(u);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSubmit(data) {
    await api.post('/transactions', data); // errors bubble up to the form
    await loadAll();                         // refresh stock + history
  }

  return (
    <>
      <PageHeader title="Transactions" subtitle="Add stock, borrow and return books. Every change is logged." />
      <Message text={error} />
      <div className="split">
        <TransactionForm books={books} users={users} onSubmit={handleSubmit} />
        <div>
          <h2 className="first-h2">History</h2>
          <TransactionLog transactions={transactions} />
        </div>
      </div>
    </>
  );
}
