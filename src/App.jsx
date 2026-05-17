import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Info } from 'lucide-react';
import './App.css'; // Just keeping it empty to not break vite's default if we left import
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import OrdersPanel from './components/OrdersPanel';
import MenuManager from './components/MenuManager';
import Toast from './components/Toast';
import Login from './components/Login';
import Settings from './components/Settings';
import Reports from './components/Reports';
import PromoManager from './components/PromoManager';
import FeedbackPanel from './components/FeedbackPanel';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [showUpdateReady, setShowUpdateReady] = useState(false);
  const APP_VERSION = '3.1.0';
  
  const isFirstLoad = useRef(true);
  const prevOrderIds = useRef(new Set());

  const addToast = (title, message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listen to orders
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let newOrders = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        newOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (!isFirstLoad.current) {
          newOrders.forEach(order => {
            if (order.status === 'pending' && !prevOrderIds.current.has(order.id)) {
              const orderTypeStr = order.orderType === 'takeaway' ? 'Takeaway' : 'Dine In';
              addToast('New Order!', `[${orderTypeStr}] ${order.userName || 'Customer'} (Table ${order.table_number}) placed an order for ₹${order.total_amount}`, 'success');
              
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log("Audio autoplay blocked by browser"));

              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Order Received!', {
                  body: `[${orderTypeStr}] ${order.userName || 'Customer'} (Table ${order.table_number}) placed an order for ₹${order.total_amount}`,
                  icon: '/vite.svg'
                });
              }
            }
          });
        }
        
        prevOrderIds.current = new Set(newOrders.map(o => o.id));
        setOrders(newOrders);
        isFirstLoad.current = false;
      } else {
        setOrders([]);
        isFirstLoad.current = false;
      }
    });

    // Listen to dishes
    const dishesRef = ref(db, 'dishes');
    const unsubscribeDishes = onValue(dishesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let newDishes = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setDishes(newDishes);
      } else {
        setDishes([]);
      }
    });

    // Listen to feedback
    const feedbackRef = ref(db, 'feedback');
    const unsubscribeFeedback = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let newFeedback = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setFeedback(newFeedback);
      } else {
        setFeedback([]);
      }
    });

    const handleUpdateAvailable = () => setShowUpdateReady(true);
    window.addEventListener('swUpdateAvailable', handleUpdateAvailable);

    return () => {
      unsubscribeOrders();
      unsubscribeDishes();
      unsubscribeFeedback();
      window.removeEventListener('swUpdateAvailable', handleUpdateAvailable);
    };
  }, []); 

  const handleUpdateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      });
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} />;
      case 'orders':
        return <OrdersPanel orders={orders} setOrders={setOrders} addToast={addToast} />;
      case 'menu':
        return <MenuManager dishes={dishes} setDishes={setDishes} addToast={addToast} />;
      case 'promo':
        return <PromoManager addToast={addToast} />;
      case 'reports':
        return <Reports orders={orders} />;
      case 'settings':
        return <Settings addToast={addToast} />;
      case 'feedback':
        return <FeedbackPanel feedback={feedback} />;
      default:
        return <Dashboard orders={orders} />;
    }
  };

  const handleLogin = () => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAdminAuthenticated');
    if (savedAuth === 'true' && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="main-content">
        <Topbar 
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').trim()} 
          pendingOrdersCount={pendingOrdersCount} 
        />
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Version Update Notification */}
      {showUpdateReady && (
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 2000,
          width: 'min(90%, 400px)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ 
            background: 'var(--primary-blue)', 
            color: 'white', 
            padding: '1rem 1.5rem', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <RefreshCw size={20} className="animate-spin-slow" />
              <div>
                <div style={{ fontWeight: '600' }}>Admin Update Available</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>New version is ready to install</div>
              </div>
            </div>
            <button 
              onClick={handleUpdateApp}
              style={{ 
                background: 'white', 
                color: 'var(--primary-blue)', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
