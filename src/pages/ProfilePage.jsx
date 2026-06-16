// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  async function handleSaveInfo() {
    setInfoErr(''); setInfoMsg('');
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
    if (error) setInfoErr(error.message);
    else setInfoMsg('✅ Profil mis à jour !');
  }

  async function handleChangePassword() {
    setPassErr(''); setPassMsg('');
    if (newPass.length < 6) { setPassErr('6 caractères minimum.'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) setPassErr(error.message);
    else { setPassMsg('✅ Mot de passe changé !'); setNewPass(''); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) { alert(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />
      <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#1A8C82' }}>👤 Mon profil</h2>

        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%',
            background: '#E2E8F0', margin: '0 auto 1rem', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '2.5rem' }}>👤</span>}
          </div>
          <input type='file' accept='image/*' onChange={handleAvatarUpload} disabled={uploading}
            style={{ fontSize: '0.85rem' }} />
          {uploading && <p style={{ color: '#64748B' }}>Upload en cours...</p>}
        </div>

        {/* Infos générales */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px',
          border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
          <h3 style={{ marginTop: 0, color: '#1E293B' }}>Informations générales</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{user.email}</p>
          <input placeholder='Nom complet' value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={inputStyle} />
          {infoErr && <p style={{ color: '#DC2626' }}>{infoErr}</p>}
          {infoMsg && <p style={{ color: '#16A34A' }}>{infoMsg}</p>}
          <button onClick={handleSaveInfo} style={btnStyle}>Sauvegarder</button>
        </div>

        {/* Mot de passe */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px',
          border: '1px solid #E2E8F0' }}>
          <h3 style={{ marginTop: 0, color: '#1E293B' }}>Changer le mot de passe</h3>
          <input type='password' placeholder='Nouveau mot de passe' value={newPass}
            onChange={e => setNewPass(e.target.value)} style={inputStyle} />
          {passErr && <p style={{ color: '#DC2626' }}>{passErr}</p>}
          {passMsg && <p style={{ color: '#16A34A' }}>{passMsg}</p>}
          <button onClick={handleChangePassword} style={btnStyle}>Changer</button>
        </div>
      </main>
    </div>
  );
}

const inputStyle = { padding: '0.5rem 0.75rem', border: '1px solid #CBD5E1',
  borderRadius: '6px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
  marginBottom: '0.75rem' };
const btnStyle = { background: '#1A8C82', color: 'white', border: 'none',
  padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' };