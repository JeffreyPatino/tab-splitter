import type { LineItem, Person } from '../types';

interface Props {
  items: LineItem[];
  people: Person[];
  placeName: string;
  taxMode: 'amount' | 'percent';
  setTaxMode: (mode: 'amount' | 'percent') => void;
  taxInput: string;
  setTaxInput: (input: string) => void;
  tipMode: 'amount' | 'percent';
  setTipMode: (mode: 'amount' | 'percent') => void;
  tipInput: string;
  setTipInput: (input: string) => void;
}

export function Summary({ items, people, placeName, taxMode, setTaxMode, taxInput, setTaxInput, tipMode, setTipMode, tipInput, setTipInput }: Props) {

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const taxNum = taxMode === 'amount' 
    ? (parseFloat(taxInput) || 0) 
    : Math.round((subtotal * (parseFloat(taxInput) || 0) / 100) * 100) / 100;
  
  const taxPercentCalculated = taxMode === 'percent' ? (parseFloat(taxInput) || 0) : (subtotal > 0 ? (taxNum / subtotal) * 100 : 0);

  const tipNum = tipMode === 'amount' 
    ? (parseFloat(tipInput) || 0) 
    : Math.round((subtotal * (parseFloat(tipInput) || 0) / 100) * 100) / 100;
    
  const tipPercentCalculated = tipMode === 'percent' ? (parseFloat(tipInput) || 0) : (subtotal > 0 ? (tipNum / subtotal) * 100 : 0);

  const grandTotal = subtotal + taxNum + tipNum;

  const getPersonSubtotal = (personId: string) => {
    return items.reduce((total, item) => {
      if (item.claimedBy.includes(personId)) {
        return total + (item.price / item.claimedBy.length);
      }
      return total;
    }, 0);
  };

  const getPersonTotal = (personId: string) => {
    const pSubtotal = getPersonSubtotal(personId);
    if (subtotal === 0) return 0;
    const shareRatio = pSubtotal / subtotal;
    const pTax = Math.round((taxNum * shareRatio) * 100) / 100;
    const pTip = Math.round((tipNum * shareRatio) * 100) / 100;
    const pSubtotalRounded = Math.round(pSubtotal * 100) / 100;
    return pSubtotalRounded + pTax + pTip;
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem' }}>3. Settlement & Summary</h2>

      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '32px', border: '1px solid var(--glass-border)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.1rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
          <span style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Tax</label>
          <div className="mobile-stack" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>$</span>
              <input 
                type="number" step="0.01" min="0" placeholder="0.00"
                value={taxMode === 'amount' ? taxInput : (taxNum > 0 ? taxNum.toFixed(2) : '')} 
                onChange={e => { 
                  setTaxMode('amount'); 
                  const val = e.target.value.replace(/-/g, '');
                  if (val.includes('.') && val.split('.')[1].length > 2) return;
                  setTaxInput(val); 
                }}
                style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            <span style={{ color: 'var(--text-muted)' }}>or</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="number" step="0.001" min="0" placeholder="0"
                value={taxMode === 'percent' ? taxInput : (taxPercentCalculated > 0 ? taxPercentCalculated.toFixed(2) : '')} 
                onChange={e => { setTaxMode('percent'); setTaxInput(e.target.value.replace(/-/g, '')); }}
                style={{ width: '100%', padding: '12px 28px 12px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Tip</label>
          <div className="mobile-stack" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}>$</span>
              <input 
                type="number" step="0.01" min="0" placeholder="0.00"
                value={tipMode === 'amount' ? tipInput : (tipNum > 0 ? tipNum.toFixed(2) : '')} 
                onChange={e => { 
                  setTipMode('amount'); 
                  const val = e.target.value.replace(/-/g, '');
                  if (val.includes('.') && val.split('.')[1].length > 2) return;
                  setTipInput(val); 
                }}
                style={{ width: '100%', padding: '12px 12px 12px 28px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              />
            </div>
            <span style={{ color: 'var(--text-muted)' }}>or</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="number" step="0.001" min="0" placeholder="0"
                value={tipMode === 'percent' ? tipInput : (tipPercentCalculated > 0 ? tipPercentCalculated.toFixed(2) : '')} 
                onChange={e => { setTipMode('percent'); setTipInput(e.target.value.replace(/-/g, '')); }}
                style={{ width: '100%', padding: '12px 28px 12px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.4rem' }}>
          <span>Grand Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {people.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Add people and items above to see the summary.</p>}
        {people.map(person => {
          const total = getPersonTotal(person.id);
          return (
            <div key={person.id} className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--glass-border)', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>{person.name}</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Owes: <span style={{ color: 'white', fontWeight: '600' }}>${total.toFixed(2)}</span></div>
              </div>
              {person.venmoUsername && (
                <a 
                  href={`https://account.venmo.com/pay?txn=charge&audience=private&recipients=${person.venmoUsername.replace('@', '')}&amount=${total.toFixed(2)}&note=${placeName ? encodeURIComponent(placeName) : 'Tab%20Splitter'}`} 
                  className="btn-primary"
                  style={{ width: 'auto', padding: '8px 20px', textDecoration: 'none', background: '#008CFF', border: 'none' }}
                >
                  Request on Venmo
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
