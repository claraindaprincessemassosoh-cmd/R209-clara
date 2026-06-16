import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList from '../components/TaskList';
import Navbar from '../components/Navbar';

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [boardId, setBoardId] = useState(null);
  const [stats, setStats] = useState({ todo: 0, in_progress: 0, review: 0, done: 0 });

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  }

  async function fetchStats() {
    const { data, error } = await supabase
      .from('tasks')
      .select('status');
    console.log('stats data:', data, 'error:', error);
    if (data) {
      const counts = { todo: 0, in_progress: 0, review: 0, done: 0 };
      data.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
      setStats(counts);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchStats();
    supabase.from('boards').select('id').limit(1)
      .then(({ data }) => { if (data?.[0]) setBoardId(data[0].id); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main style={{ padding: '2rem' }}>

        {/* Compteurs par statut */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: '📋 À faire', key: 'todo', color: '#64748B' },
            { label: '⚙️ En cours', key: 'in_progress', color: '#3B82F6' },
            { label: '👀 Validation', key: 'review', color: '#F59E0B' },
            { label: '✅ Terminée', key: 'done', color: '#16A34A' },
          ].map(({ label, key, color }) => (
            <div key={key} style={{ background: 'white', border: `2px solid ${color}`,
              borderRadius: '10px', padding: '1rem', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{stats[key]}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[['tasks', '📋 Tâches'], ['users', '👥 Utilisateurs']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '0.5rem 1rem', borderRadius: '6px', border: 'none',
              cursor: 'pointer',
              background: tab === key ? '#1A8C82' : '#E2E8F0',
              color: tab === key ? 'white' : '#1E293B',
              fontWeight: tab === key ? 700 : 400,
            }}>{label}</button>
          ))}
        </div>

        {/* Contenu selon onglet */}
        {tab === 'tasks' && boardId && <TaskList boardId={boardId} onTaskChange={fetchStats} />}
        {tab === 'tasks' && !boardId && (
          <p style={{ color: '#94A3B8' }}>Aucun tableau trouvé. Créez-en un via SQL Editor.</p>
        )}
        {tab === 'users' && (
          loading ? <p>Chargement...</p> : <UserTable users={users} onRefresh={fetchUsers} />
        )}
      </main>
    </div>
  );
}