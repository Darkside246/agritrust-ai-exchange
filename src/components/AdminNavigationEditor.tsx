import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { CMSNavigationItem } from '../core/database/schema';
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Save, CheckCircle2 } from 'lucide-react';

export const AdminNavigationEditor: React.FC = () => {
  const [items, setItems] = useState<CMSNavigationItem[]>(AgriTrustDatabase.getNavigationItems());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = () => {
    AgriTrustDatabase.updateNavigationItems(items);
    setSuccessMsg('Public navigation menu updated successfully!');
  };

  const handleAddItem = () => {
    const newItem: CMSNavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      path: '#',
      displayOrder: items.length + 1,
      visible: true,
    };
    setItems([...items, newItem]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    copy.forEach((item, idx) => {
      item.displayOrder = idx + 1;
    });

    setItems(copy);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>HEADER NAVIGATION</span>
        <h1 className="text-3xl font-bold">Public Navigation Menu</h1>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, index) => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr auto auto', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <input
              type="text"
              value={item.label}
              onChange={(e) => {
                const val = e.target.value;
                setItems(items.map((i) => (i.id === item.id ? { ...i, label: val } : i)));
              }}
              className="input-field"
              placeholder="Label"
            />

            <input
              type="text"
              value={item.path}
              onChange={(e) => {
                const val = e.target.value;
                setItems(items.map((i) => (i.id === item.id ? { ...i, path: val } : i)));
              }}
              className="input-field"
              placeholder="Path (e.g. #marketplace)"
            />

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                <ArrowUp size={12} />
              </button>
              <button onClick={() => handleMove(index, 'down')} disabled={index === items.length - 1} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                <ArrowDown size={12} />
              </button>
            </div>

            <button onClick={() => handleDelete(item.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--status-danger)', padding: '0.25rem' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button onClick={handleAddItem} className="btn btn-secondary btn-sm">
            <Plus size={14} /> Add Navigation Item
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-md">
            <Save size={16} /> Save Navigation Menu
          </button>
        </div>
      </div>
    </div>
  );
};
