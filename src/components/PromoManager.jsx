import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Ticket } from 'lucide-react';

export default function PromoManager({ addToast }) {
  const [promoCodes, setPromoCodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minAmount: '0',
    expiryDate: '',
    usageLimit: '',
    usageLimitPerUser: '',
    appliesToAll: true,
    applicableItems: [],
    active: true
  });
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const promoRef = ref(db, 'promo_codes');
    const unsubscribe = onValue(promoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setPromoCodes(list);
      } else {
        setPromoCodes([]);
      }
    });

    const dishesRef = ref(db, 'dishes');
    const unsubscribeDishes = onValue(dishesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMenuItems(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeDishes();
    };
  }, []);

  const openModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({ ...promo });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        minAmount: '0',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: '',
        usageLimitPerUser: '',
        appliesToAll: true,
        applicableItems: [],
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      code: formData.code.toUpperCase(),
      value: Number(formData.value),
      minAmount: Number(formData.minAmount),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : null,
      applicableItems: formData.appliesToAll ? [] : formData.applicableItems
    };

    try {
      if (editingPromo) {
        await update(ref(db, `promo_codes/${editingPromo.id}`), data);
        addToast('Success', 'Promo code updated successfully', 'success');
      } else {
        await push(ref(db, 'promo_codes'), data);
        addToast('Success', 'Promo code created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast('Error', 'Failed to save promo code', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        await remove(ref(db, `promo_codes/${id}`));
        addToast('Deleted', 'Promo code removed', 'success');
      } catch (error) {
        addToast('Error', 'Failed to delete promo code', 'danger');
      }
    }
  };

  const toggleStatus = async (promo) => {
    try {
      await update(ref(db, `promo_codes/${promo.id}`), { active: !promo.active });
      addToast('Status Updated', `Promo code is now ${!promo.active ? 'Active' : 'Inactive'}`, 'info');
    } catch (error) {
      addToast('Error', 'Failed to update status', 'danger');
    }
  };

  return (
    <div className="promo-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Promo Codes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage discounts and offers for your customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} /> Add Promo Code
        </button>
      </div>

      <div className="grid-cards">
        {promoCodes.map((promo) => (
          <div key={promo.id} className="card" style={{ borderLeft: `4px solid ${promo.active ? 'var(--success-green)' : 'var(--danger-red)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="var(--primary-color)" />
                <span style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '1px' }}>{promo.code}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn" onClick={() => openModal(promo)} title="Edit">
                  <Edit2 size={16} />
                </button>
                <button className="icon-btn" style={{ color: 'var(--danger-red)' }} onClick={() => handleDelete(promo.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success-green)' }}>
                {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Min. Order: ₹{promo.minAmount}
                {promo.usageLimit && ` • Max Uses: ${promo.usageLimit}`}
                {promo.usageLimitPerUser && ` • Max Per User: ${promo.usageLimitPerUser}`}
                <br/>
                {promo.appliesToAll ? 'Applies to: Entire Menu' : `Applies to: ${promo.applicableItems?.length || 0} Items`}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Expires: {promo.expiryDate}
              </div>
              <button 
                onClick={() => toggleStatus(promo)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  color: promo.active ? 'var(--success-green)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                {promo.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {promo.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Promo Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="E.g. WELCOME50"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select 
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? 'e.g. 10' : 'e.g. 100'}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Min. Order Amount (₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Total Usage Limit (Optional)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="form-group">
                  <label>Limit Per User (Optional)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.usageLimitPerUser || ''}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.appliesToAll} 
                    onChange={(e) => setFormData({ ...formData, appliesToAll: e.target.checked })}
                  />
                  Applies to entire menu
                </label>
              </div>

              {!formData.appliesToAll && (
                <div className="form-group">
                  <label>Select Applicable Items</label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px' }}>
                    {menuItems.map(item => (
                      <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.applicableItems && formData.applicableItems.includes(item.id)}
                          onChange={(e) => {
                            const currentItems = formData.applicableItems || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, applicableItems: [...currentItems, item.id] });
                            } else {
                              setFormData({ ...formData, applicableItems: currentItems.filter(id => id !== item.id) });
                            }
                          }}
                        />
                        {item.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingPromo ? 'Update' : 'Create'} Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
