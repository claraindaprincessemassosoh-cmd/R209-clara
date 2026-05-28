import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <header style={{ background: '#1A8C82', color: 'white',
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1>🗂 KanbanRT — Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>{session.user.email}</span>
          <button onClick={handleLogout}
            style={{ background: 'white', color: '#1A8C82',
              border: 'none', padding: '0.5rem 1rem', borderRadius: '6px',
              cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </header>
      <main style={{ padding: '2rem' }}>
        <h2>👥 Utilisateurs inscrits</h2>
        {loading ? <p>Chargement...</p>
          : <UserTable users={users} onRefresh={fetchUsers} />}
      </main>
    </div>
  );
}