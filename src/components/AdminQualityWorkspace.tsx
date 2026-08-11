import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { QualityInspectionWorkspace } from './QualityInspectionWorkspace';

export const AdminQualityWorkspace: React.FC = () => {
  const lots = AgriTrustDatabase.getAllLots();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || 'AT-LOT-2026-000922');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>OPERATIONAL QUALITY WORKSPACE</span>
          <h2 className="text-xl font-bold">Dynamic Target Lot Selector</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label className="input-label" style={{ margin: 0, fontSize: '0.8125rem' }}>Target Lot:</label>
          <select
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            className="input-field"
            style={{ width: '220px', fontWeight: 700, fontFamily: 'monospace' }}
          >
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} ({l.commodity})
              </option>
            ))}
          </select>
        </div>
      </div>

      <QualityInspectionWorkspace initialLotId={selectedLotId} onInspectTraceability={(lotId) => {}} />
    </div>
  );
};
