import { useState } from 'react'
import './index.css'
import type { LineItem, Person } from './types'
import { PeopleManager } from './components/PeopleManager'
import { ItemsManager } from './components/ItemsManager'
import { Summary } from './components/Summary'
import { useEffect } from 'react'
import { onAuthStateChanged, signOut, deleteUser, type User } from 'firebase/auth'
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { LoginModal } from './components/LoginModal'
import { ReceiptScanner } from './components/ReceiptScanner'

function App() {
  const [placeName, setPlaceName] = useState('')
  const [items, setItems] = useState<LineItem[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [activePersonId, setActivePersonId] = useState<string | null>(null)
  
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)

  const [taxMode, setTaxMode] = useState<'amount' | 'percent'>('amount')
  const [taxInput, setTaxInput] = useState('')
  const [tipMode, setTipMode] = useState<'amount' | 'percent'>('percent')
  const [tipInput, setTipInput] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm("Are you sure you want to completely delete your account and all saved Address Book data? This cannot be undone.");
    if (!confirmed) return;
    
    try {
      // 1. Delete all saved friends to clean up user data
      const q = query(collection(db, `users/${user.uid}/friends`));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, `users/${user.uid}/friends/${d.id}`)));
      await Promise.all(deletePromises);
      
      // 2. Delete the auth user
      await deleteUser(user);
      alert("Your account and all data have been deleted.");
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in before deleting your account.");
      } else {
        alert("Error deleting account: " + err.message);
      }
    }
  };

  const getPersonSubtotal = (personId: string) => {
    return items.reduce((total, item) => {
      if (item.claimedBy.includes(personId)) {
        return total + (item.price / item.claimedBy.length);
      }
      return total;
    }, 0);
  };

  const handleRemovePerson = (personId: string) => {
    setPeople(people.filter(p => p.id !== personId));
    setItems(items.map(item => ({
      ...item,
      claimedBy: item.claimedBy.filter(id => id !== personId)
    })));
    if (activePersonId === personId) {
      setActivePersonId(null);
    }
  };

  const handleScanComplete = (newItems: LineItem[], tax?: number, tip?: number, scannedPlaceName?: string) => {
    setItems(prev => [...prev, ...newItems]);
    if (tax !== undefined && tax !== null) {
      setTaxMode('amount');
      setTaxInput(tax.toString());
    }
    if (tip !== undefined && tip !== null) {
      setTipMode('amount');
      setTipInput(tip.toString());
    }
    if (scannedPlaceName) {
      setPlaceName(scannedPlaceName);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
        {user ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</span>
            <button onClick={() => signOut(auth)} className="btn-secondary" style={{ padding: '6px 12px', width: 'auto', fontSize: '0.9rem' }}>Log Out</button>
            <button onClick={handleDeleteAccount} className="btn-secondary" style={{ padding: '6px 12px', width: 'auto', fontSize: '0.9rem', color: '#ef4444', borderColor: '#ef4444' }}>Delete Account</button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="btn-secondary" style={{ padding: '6px 12px', width: 'auto', fontSize: '0.9rem' }}>
            Log in to save Address Book
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '40px 0 20px 0' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tab Splitter</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>Split the bill with zero friction.</p>
        
        <input 
          type="text" 
          autoComplete="none"
          data-1p-ignore
          data-lpignore="true"
          placeholder="Where did you go? (e.g. Joe's Diner)"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1.1rem', textAlign: 'center' }}
        />
      </div>

      <ReceiptScanner onScanComplete={handleScanComplete} />

      <PeopleManager 
        people={people} 
        setPeople={setPeople} 
        activePersonId={activePersonId} 
        setActivePersonId={setActivePersonId} 
        getPersonSubtotal={getPersonSubtotal}
        user={user}
        onRemovePerson={handleRemovePerson}
      />

      <ItemsManager 
        items={items} 
        setItems={setItems} 
        activePersonId={activePersonId} 
      />

      <Summary 
        items={items} 
        people={people} 
        placeName={placeName}
        taxMode={taxMode}
        setTaxMode={setTaxMode}
        taxInput={taxInput}
        setTaxInput={setTaxInput}
        tipMode={tipMode}
        setTipMode={setTipMode}
        tipInput={tipInput}
        setTipInput={setTipInput}
      />
    </div>
  )
}

export default App
