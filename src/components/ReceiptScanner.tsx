import { useState, useRef } from 'react';
import type { LineItem } from '../types';

interface Props {
  onScanComplete: (items: LineItem[], tax?: number, tip?: number, placeName?: string) => void;
}

export function ReceiptScanner({ onScanComplete }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("No canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          }, 'image/jpeg', 0.6);
        };
        img.onerror = (e) => reject(e);
        img.src = event.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError('');

    try {
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedBlob, 'receipt.jpg');

      const workerUrl = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787/';
      const response = await fetch(workerUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.items && Array.isArray(data.items)) {
        const newItems: LineItem[] = data.items.map((item: any) => ({
          id: crypto.randomUUID(),
          name: item.name || 'Unknown Item',
          price: Number(item.price) || 0,
          claimedBy: []
        }));
        onScanComplete(newItems, data.tax, data.tip, data.placeName);
      } else {
        throw new Error("Invalid response format from AI.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to scan receipt.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} 
      />
      
      <button 
        className="btn-secondary" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        style={{ 
          width: '100%', 
          padding: '16px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '12px', 
          fontSize: '1.1rem', 
          background: isScanning ? 'rgba(255,255,255,0.1)' : undefined,
          border: isScanning ? '1px solid var(--glass-border)' : undefined
        }}
      >
        {isScanning ? (
          <>
            <span className="spinner" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            Analyzing receipt...
          </>
        ) : (
          <>
            📷 Scan Receipt (AI)
          </>
        )}
      </button>

      {error && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.9rem' }}>
          <strong>Error:</strong> {error} <br/>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Please double check the items manually.</span>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
