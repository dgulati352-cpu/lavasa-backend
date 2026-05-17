import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings, LogOut, Download, TrendingUp, Ticket, Star } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { id: 'menu', label: 'Menu Manager', icon: <UtensilsCrossed size={20} /> },
    { id: 'promo', label: 'Promo Codes', icon: <Ticket size={20} /> },
    { id: 'feedback', label: 'Customer Feedback', icon: <Star size={20} /> },
    { id: 'reports', label: 'Daily Reports', icon: <TrendingUp size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Lavassa Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        <h2>Lavassa</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <a
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0' }}>
        {showInstallBtn && (
          <a className="nav-item install-btn" onClick={handleInstallClick} style={{ cursor: 'pointer', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '8px' }}>
            <Download size={20} />
            <span>Download App</span>
          </a>
        )}
        <a className="nav-item" onClick={onLogout} style={{ cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </a>
        <div style={{ padding: '12px 24px', opacity: 0.5, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Version 3.1.0</span>
        </div>
      </div>
    </aside>
  );
}

