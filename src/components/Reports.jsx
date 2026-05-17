import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reports({ orders = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter orders for the selected date with safety checks
  const filteredOrders = (orders || []).filter(order => {
    if (!order || !order.timestamp) return false;
    try {
      const date = new Date(order.timestamp);
      if (isNaN(date.getTime())) return false; // Skip invalid dates
      const orderDate = date.toISOString().split('T')[0];
      return orderDate === selectedDate;
    } catch (e) {
      return false;
    }
  });

  const dailyRevenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
  const dailyOrderCount = filteredOrders.length;
  
  const paymentBreakdown = filteredOrders.reduce((acc, order) => {
    const method = order.payment_method || 'Cash';
    acc[method] = (acc[method] || 0) + (Number(order.total_amount) || 0);
    return acc;
  }, {});

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="reports-container">
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--primary-color)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Daily Payment Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Overview of revenue and transactions</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => changeDate(-1)} style={{ padding: '8px' }}>
            <ChevronLeft size={20} />
          </button>
          <input 
            type="date" 
            className="form-control" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          />
          <button className="btn btn-outline" onClick={() => changeDate(1)} style={{ padding: '8px' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid-cards" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success-green)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Total Revenue</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>₹{dailyRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Orders Completed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{dailyOrderCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#f59e0b' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Avg. Order Value</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              ₹{dailyOrderCount > 0 ? Math.round(dailyRevenue / dailyOrderCount).toLocaleString() : 0}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Daily Transactions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 0', fontWeight: '500', fontSize: '0.9rem' }}>Time</th>
                <th style={{ padding: '12px 0', fontWeight: '500', fontSize: '0.9rem' }}>Table</th>
                <th style={{ padding: '12px 0', fontWeight: '500', fontSize: '0.9rem' }}>Payment</th>
                <th style={{ padding: '12px 0', fontWeight: '500', fontSize: '0.9rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                  <td style={{ padding: '12px 0', fontSize: '0.9rem' }}>
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '0.9rem' }}>Table {order.table_number || 'N/A'}</td>
                  <td style={{ padding: '12px 0', fontSize: '0.9rem' }}>{order.payment_method || 'Cash'}</td>
                  <td style={{ padding: '12px 0', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right' }}>
                    ₹{Number(order.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No orders found for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Payment Methods</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(paymentBreakdown).length > 0 ? Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>{method}</span>
                  <span style={{ fontWeight: '600' }}>₹{amount.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'rgba(51, 65, 85, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: dailyRevenue > 0 ? `${(amount / dailyRevenue) * 100}%` : '0%', 
                    backgroundColor: method === 'Cash' ? '#10b981' : '#3b82f6' 
                  }} />
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
