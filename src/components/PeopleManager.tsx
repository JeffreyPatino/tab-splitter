import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { User } from 'firebase/auth';
import type { Person } from '../types';
import { AddressBookModal, type SavedFriend } from './AddressBookModal';

interface Props {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  activePersonId: string | null;
  setActivePersonId: (id: string | null) => void;
  getPersonSubtotal: (personId: string) => number;
  user: User | null;
  onRemovePerson: (id: string) => void;
}

export function PeopleManager({ people, setPeople, activePersonId, setActivePersonId, getPersonSubtotal, user, onRemovePerson }: Props) {
  const [newPersonName, setNewPersonName] = useState('');
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [savedFriends, setSavedFriends] = useState<SavedFriend[]>([]);
  const [showAddressBook, setShowAddressBook] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedFriends([]);
      return;
    }
    const q = query(collection(db, `users/${user.uid}/friends`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friends: SavedFriend[] = [];
      snapshot.forEach((doc) => {
        friends.push({ id: doc.id, ...doc.data() } as SavedFriend);
      });
      setSavedFriends(friends);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    
    const existing = savedFriends.find(f => f.name.toLowerCase() === newPersonName.trim().toLowerCase());
    
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: newPersonName.trim(),
      venmoUsername: existing ? existing.venmoUsername : undefined
    };
    
    setPeople([...people, newPerson]);
    setNewPersonName('');
    if (!activePersonId) setActivePersonId(newPerson.id);
  };

  const handleSelectFromAddressBook = (selected: SavedFriend[]) => {
    const newPeople = selected.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      venmoUsername: f.venmoUsername
    }));
    setPeople([...people, ...newPeople]);
    setShowAddressBook(false);
    if (!activePersonId && newPeople.length > 0) setActivePersonId(newPeople[0].id);
  };

  const startEdit = (e: React.MouseEvent, person: Person) => {
    e.stopPropagation();
    setEditingPersonId(person.id);
    setEditName(person.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      setPeople(people.map(p => p.id === id ? { ...p, name: editName.trim() } : p));
    }
    setEditingPersonId(null);
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      {showAddressBook && user && (
        <AddressBookModal 
          user={user}
          savedFriends={savedFriends}
          onClose={() => setShowAddressBook(false)}
          onSelect={handleSelectFromAddressBook}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>1. Who is eating?</h2>
        {user && (
          <button onClick={() => setShowAddressBook(true)} className="btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.9rem' }}>
            Address Book
          </button>
        )}
      </div>
      
      <form onSubmit={handleAddPerson} className="mobile-stack" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text" 
          autoComplete="off"
          list="saved-friends"
          placeholder="Add a person's name..." 
          value={newPersonName} 
          onChange={e => setNewPersonName(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
        />
        <datalist id="saved-friends">
          {savedFriends.map(f => <option key={f.id} value={f.name} />)}
        </datalist>
        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Add</button>
      </form>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        {people.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No one added yet.</p>}
        {people.map(person => (
          <button 
            key={person.id}
            onClick={() => setActivePersonId(person.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activePersonId === person.id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
              background: activePersonId === person.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {editingPersonId === person.id ? (
              <input 
                autoFocus 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                onBlur={() => saveEdit(person.id)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(person.id); }}
                onClick={e => e.stopPropagation()}
                style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', width: '80px', fontSize: '1rem', borderBottom: '1px solid white' }}
              />
            ) : (
              <>
                {person.name} (${getPersonSubtotal(person.id).toFixed(2)})
                <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                  <span onClick={(e) => startEdit(e, person)} style={{ opacity: 0.7, fontSize: '0.9rem', padding: '2px' }}>✏️</span>
                  <span onClick={(e) => { e.stopPropagation(); onRemovePerson(person.id); }} style={{ opacity: 0.7, fontSize: '0.9rem', color: '#ef4444', padding: '2px' }}>✕</span>
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
