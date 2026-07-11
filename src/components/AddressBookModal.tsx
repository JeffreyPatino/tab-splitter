import { useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';

export interface SavedFriend {
  id: string;
  name: string;
  venmoUsername: string;
}

interface Props {
  user: User;
  savedFriends: SavedFriend[];
  onClose: () => void;
  onSelect: (friends: SavedFriend[]) => void;
}

export function AddressBookModal({ user, savedFriends, onClose, onSelect }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState('');
  const [newVenmo, setNewVenmo] = useState('');

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addDoc(collection(db, `users/${user.uid}/friends`), {
      name: newName.trim(),
      venmoUsername: newVenmo.trim()
    });
    setNewName('');
    setNewVenmo('');
  };
  
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, `users/${user.uid}/friends/${id}`));
  };

  const handleDone = () => {
    const selected = savedFriends.filter(f => selectedIds.has(f.id));
    onSelect(selected);
  };

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Address Book</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleAddFriend} className="mobile-stack" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            required
          />
          <input 
            type="text" 
            placeholder="@venmo (optional)" 
            value={newVenmo}
            onChange={e => setNewVenmo(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '8px 16px', width: 'auto' }}>Save</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {savedFriends.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No friends saved yet.</p>}
          {savedFriends.map(friend => (
            <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.has(friend.id)} 
                onChange={() => toggleSelect(friend.id)}
                style={{ width: '20px', height: '20px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600' }}>{friend.name}</div>
                {friend.venmoUsername && <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)' }}>{friend.venmoUsername}</div>}
              </div>
              <button onClick={() => handleDelete(friend.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>

        <button onClick={handleDone} className="btn-primary" disabled={selectedIds.size === 0}>
          Add Selected to Bill
        </button>
      </div>
    </div>,
    document.body
  );
}
