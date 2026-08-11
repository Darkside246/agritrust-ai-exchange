import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { AIAgentRecord, AIRunRecord } from '../core/database/schema';
import { Bot, Activity, ShieldAlert, Pause, Play, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface AdminAIMonitoringProps {
  defaultTab?: 'AGENTS' | 'RUNS';
}

export const AdminAIMonitoring: React.FC<AdminAIMonitoringProps> = ({ defaultTab = 'AGENTS' }) => {
  const [activeTab, setActiveTab] = useState<'AGENTS' | 'RUNS'>(defaultTab);
  const [agents, setAgents] = useState<AIAgentRecord[]>(AgriTrustDatabase.getAIAgents());
  const [runs, setRuns] = useState<AIRunRecord[]>(AgriTrustDatabase.getAIRuns());
  const [selectedAgent, setSelectedAgent] = useState<AIAgentRecord | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateStatus = (agentId: string, nextStatus: AIAgentRecord['status']) => {
    const updated = AgriTrustDatabase.updateAIAgentStatus(agentId, nextStatus, 'sys-admin');
    setAgents(AgriTrustDatabase.getAIAgents());
    setSuccessMsg(`AI Agent '${updated.name}' status changed to ${nextStatus}. Control action audited.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)' }}>
          AI GOVERNANCE & TELEMETRY
        </span>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          AI Agent Registry & Run Monitoring
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Authoritative oversight for AI agents, execution logs, and emergency boundary controls.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--brand-primary-light)',
          color: 'var(--brand-primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('AGENTS')}
          className={`btn btn-sm ${activeTab === 'AGENTS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Bot size={16} /> Registered AI Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('RUNS')}
          className={`btn btn-sm ${activeTab === 'RUNS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} /> AI Execution Runs ({runs.length})
        </button>
      </div>

      {/* Tab 1: Agents Registry */}
      {activeTab === 'AGENTS' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '1fr 340px' : '1fr', gap: '1.75rem' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.875rem 1rem' }}>Agent Name</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Version</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Purpose</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Risk Level</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Emergency Control</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{agent.name}</div>
                        <span className="text-muted text-xs" style={{ fontFamily: 'monospace' }}>{agent.id}</span>
                      </button>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{agent.version}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                      {agent.purpose}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${agent.riskLevel === 'HIGH' ? 'badge-accent' : 'badge-brand'}`} style={{ fontSize: '0.7rem' }}>
                        {agent.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className={`badge ${agent.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {agent.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      {agent.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(agent.id, 'PAUSED')}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--brand-accent)' }}
                        >
                          <Pause size={14} /> Pause Agent
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(agent.id, 'ACTIVE')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <Play size={14} /> Activate Agent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Agent Capabilities Inspector */}
          {selectedAgent && (
            <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h4 className="font-bold text-base">{selectedAgent.name}</h4>
                <button onClick={() => setSelectedAgent(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                  Close
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.8125rem' }}>
                <div>
                  <span className="text-muted text-xs block font-semibold">ALLOWED CAPABILITIES</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {selectedAgent.allowedCapabilities.map((cap) => (
                      <span key={cap} className="badge badge-brand" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-muted text-xs block font-semibold">ALLOWED TOOLS</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                    {selectedAgent.allowedTools.map((tool) => (
                      <span key={tool} className="badge badge-success" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-muted text-xs font-semibold">FORBIDDEN CAPABILITIES</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)', marginTop: '0.25rem', fontWeight: 600 }}>
                    CREATE_AGENT, DELETE_AUDIT, MODIFY_SECURITY, RELEASE_PAYMENT, EXPORT_ALL_PII
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Execution Runs */}
      {activeTab === 'RUNS' && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.875rem 1rem' }}>Run ID</th>
                <th style={{ padding: '0.875rem 1rem' }}>Timestamp</th>
                <th style={{ padding: '0.875rem 1rem' }}>AI Agent</th>
                <th style={{ padding: '0.875rem 1rem' }}>Action</th>
                <th style={{ padding: '0.875rem 1rem' }}>Target Entity</th>
                <th style={{ padding: '0.875rem 1rem' }}>Confidence</th>
                <th style={{ padding: '0.875rem 1rem' }}>Policy Result</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    {run.id}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(run.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                    {run.agentName}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{run.requestedAction}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace' }}>
                    {run.inputEntity}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {run.confidence}%
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${run.policyResult === 'PASSED' ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: '0.7rem' }}>
                      {run.policyResult}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
