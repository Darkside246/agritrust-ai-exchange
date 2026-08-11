import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { ExtendedTraceabilityView } from './ExtendedTraceabilityView';
import { Search, Layers } from 'lucide-react';

export const AdminTraceabilityWorkspace: React.FC = () => {
  const lots = AgriTrustDatabase.getAllLots();
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || 'AT-LOT-2026-000922');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>INTERNAL TRACEABILITY WORKSPACE</span>
          <h2 className="text-xl font-bold">SHA-256 Provenance & Event Ledger Inspector</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label className="input-label" style={{ margin: 0, fontSize: '0.8125rem' }}>Select Lot:</label>
          <select
            value={selectedLotId}
            onChange={(e) => setSelectedLotId(e.target.value)}
            className="input-field"
            style={{ width: '240px', fontWeight: 700, fontFamily: 'monospace' }}
          >
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} ({l.commodity} - {l.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      <ExtendedTraceabilityView lotId={selectedLotId} onBack={() => {}} />
    </div>
  );
};
