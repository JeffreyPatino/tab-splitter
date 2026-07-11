import { useState } from 'react';
import type { LineItem } from '../types';

interface Props {
  items: LineItem[];
  setItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  activePersonId: string | null;
}

export function ItemsManager({ items, setItems, activePersonId }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      name,
      price: parseFloat(price),
      claimedBy: []
    };
    
    setItems([...items, newItem]);
    setName('');
    setPrice('');
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== id));
  };

  const startEdit = (e: React.MouseEvent, item: LineItem) => {
    e.stopPropagation();
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
  };

  const saveEdit = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const priceNum = parseFloat(editItemPrice);
    if (editItemName.trim() && !isNaN(priceNum) && priceNum >= 0) {
      setItems(items.map(i => i.id === id ? { ...i, name: editItemName.trim(), price: priceNum } : i));
    }
    setEditingItemId(null);
  };

  const toggleClaim = (itemId: string) => {
    if (editingItemId === itemId) return; // Disable claiming while editing
    if (!activePersonId) {
      alert('Please select a person from the top section first!');
      return;
    }
    
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isClaimed = item.claimedBy.includes(activePersonId);
        return {
          ...item,
          claimedBy: isClaimed 
            ? item.claimedBy.filter(id => id !== activePersonId)
            : [...item.claimedBy, activePersonId]
        };
      }
      return item;
    }));
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem' }}>2. What was ordered?</h2>
      
      <form onSubmit={handleAdd} className="mobile-stack" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text" 
          autoComplete="off"
          placeholder="Item (e.g. Burger)" 
          value={name} 
          onChange={e => setName(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
        />
        <input 
          type="number" 
          step="0.01"
          min="0"
          placeholder="$0.00" 
          value={price} 
          onChange={e => {
            const val = e.target.value.replace(/-/g, '');
            if (val.includes('.') && val.split('.')[1].length > 2) return;
            setPrice(val);
          }}
          style={{ width: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Add</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items added yet.</p>}
        {items.length > 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Tap items to claim them for the selected person.</p>}
        
        {items.map(item => {
          const isClaimedByActive = activePersonId && item.claimedBy.includes(activePersonId);
          return (
            <div 
              key={item.id} 
              onClick={() => toggleClaim(item.id)}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '12px 16px', 
                background: isClaimedByActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.05)', 
                borderRadius: '12px', 
                border: isClaimedByActive ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                cursor: editingItemId === item.id ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                alignItems: 'center'
              }}
            >
              {editingItemId === item.id ? (
                <form 
                  onSubmit={(e) => saveEdit(e, item.id)} 
                  style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}
                  onClick={e => e.stopPropagation()}
                >
                  <input 
                    autoFocus 
                    value={editItemName} 
                    onChange={e => setEditItemName(e.target.value)} 
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)', color: 'white' }} 
                  />
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={editItemPrice} 
                    onChange={e => {
                      const val = e.target.value.replace(/-/g, '');
                      if (val.includes('.') && val.split('.')[1].length > 2) return;
                      setEditItemPrice(val);
                    }} 
                    style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)', color: 'white' }} 
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', width: 'auto' }}>Save</button>
                </form>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: isClaimedByActive ? '600' : '400' }}>{item.name}</span>
                    {item.claimedBy.length > 0 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Split by {item.claimedBy.length} {item.claimedBy.length === 1 ? 'person' : 'people'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>${item.price.toFixed(2)}</span>
                    <button onClick={(e) => startEdit(e, item)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontSize: '1rem', opacity: 0.8 }}>✏️</button>
                    <button onClick={(e) => handleRemove(e, item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '1.2rem' }}>✕</button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
