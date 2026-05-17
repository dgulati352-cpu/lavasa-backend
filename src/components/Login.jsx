import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const FALLBACK_PASSWORDS = ['admin123', 'newpassword123', 'lavassa123'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // First check hardcoded fallback passwords (always works offline too)
    if (FALLBACK_PASSWORDS.includes(password)) {
      onLogin();
      setIsLoading(false);
      return;
    }

    // Try to verify against Firebase database
    try {
      const snapshot = await get(ref(db, 'settings/password'));
      const correctPassword = snapshot.exists() ? snapshot.val() : null;

      if (correctPassword && password === correctPassword) {
        onLogin();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('Firebase error:', err);
      // Firebase failed — password wasn't in fallback list either
      setError('Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      fontFamily: 'var(--font-family)',
      color: 'var(--text-light)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Lock size={32} color="var(--primary-blue)" />
        </div>
        
        <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: '700' }}>Admin Access</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Enter the security password to unlock the dashboard.<br/>
          <span style={{ fontSize: '0.8rem', color: 'var(--success-green)', marginTop: '4px', display: 'inline-block' }}>✓ Sessions will persist on this device</span>
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              style={{ padding: '12px 16px', fontSize: '1rem' }}
              autoFocus
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
