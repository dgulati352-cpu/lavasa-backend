import React from 'react';
import { Star, MessageSquare, Calendar } from 'lucide-react';

const FeedbackPanel = ({ feedback }) => {
  const sortedFeedback = [...feedback].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getStarRating = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={14} 
            fill={s <= rating ? '#fbbf24' : 'none'} 
            color={s <= rating ? '#fbbf24' : '#475569'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Customer Feedback</h2>
        <p style={{ color: 'var(--text-muted)' }}>Review ratings and comments from your customers</p>
      </div>

      {sortedFeedback.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <p style={{ color: 'var(--text-muted)' }}>No feedback received yet.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {sortedFeedback.map((f, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--primary-blue)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700
                  }}>
                    {(f.userName || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.userName || 'Anonymous'}</div>
                    {getStarRating(f.rating)}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(f.timestamp).toLocaleDateString()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                     #{(f.orderId || '').toString().slice(-4)}
                  </div>
                </div>
              </div>

              {f.comment && (
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.3)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  fontStyle: 'italic'
                }}>
                  "{f.comment}"
                </div>
              )}

              {!f.comment && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No comment provided.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
